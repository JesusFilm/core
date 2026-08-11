import { prisma } from '@core/prisma/media/client'

import { createEmptyParentVariant } from '../../schema/videoVariant/videoVariant'
import { updateVideoInAlgolia } from '../algolia/algoliaVideoUpdate'
import { updateVideoVariantInAlgolia } from '../algolia/algoliaVideoVariantUpdate'

export type ParentLanguageAction = 'create' | 'normalize' | 'ambiguous'
export type ParentLanguageResult = 'proposed' | 'applied' | 'failed' | 'reported'
export type ParentLanguageIndexResult = 'indexed' | 'indexFailed' | 'skipped'

export type ParentLanguageFinding = {
  parentId: string
  childVideoId: string
  languageId: string
  existingVariantId: string | null
  action: ParentLanguageAction
}

export type ParentLanguageAuditEntry = ParentLanguageFinding & {
  variantId: string | null
  result: ParentLanguageResult
  indexResult: ParentLanguageIndexResult
  error?: string
}

type ExistingParentVariant = {
  id: string
  languageId: string
  hls: string | null
  dash: string | null
  muxVideoId: string | null
  duration: number | null
  published: boolean
  downloadable: boolean
  downloads: Array<{ id: string }>
}

function hasRealMediaIndicators(variant: ExistingParentVariant): boolean {
  return (
    variant.muxVideoId != null ||
    (variant.hls ?? '') !== '' ||
    (variant.dash ?? '') !== '' ||
    (variant.duration ?? 0) > 0 ||
    variant.downloads.length > 0
  )
}

function needsNormalization(
  variant: ExistingParentVariant,
  availableLanguages: string[]
): boolean {
  return (
    !variant.published ||
    variant.downloadable !== false ||
    !availableLanguages.includes(variant.languageId)
  )
}

// Discovers required parent languages by relationship (direct published
// children of published Videos), never by container Label, and classifies
// each required language against the parent's existing Variant.
export async function findParentLanguageFindings(
  parentId: string
): Promise<ParentLanguageFinding[]> {
  const parent = await prisma.video.findUnique({
    where: { id: parentId },
    select: { id: true, availableLanguages: true }
  })
  if (parent == null) return []

  const [childVariants, parentVariants] = await Promise.all([
    prisma.videoVariant.findMany({
      where: {
        published: true,
        video: { published: true, parents: { some: { id: parentId } } }
      },
      select: { languageId: true, videoId: true }
    }),
    prisma.videoVariant.findMany({
      where: { videoId: parentId },
      select: {
        id: true,
        languageId: true,
        hls: true,
        dash: true,
        muxVideoId: true,
        duration: true,
        published: true,
        downloadable: true,
        downloads: { select: { id: true }, take: 1 }
      }
    }) as unknown as Promise<ExistingParentVariant[]>
  ])

  const requiredLanguages = new Map<string, string>()
  for (const { languageId, videoId } of childVariants) {
    if (!requiredLanguages.has(languageId)) {
      requiredLanguages.set(languageId, videoId)
    }
  }

  const parentVariantByLanguage = new Map(
    parentVariants.map((variant) => [variant.languageId, variant])
  )

  const findings: ParentLanguageFinding[] = []
  for (const [languageId, childVideoId] of requiredLanguages) {
    const existing = parentVariantByLanguage.get(languageId)
    if (existing == null) {
      findings.push({
        parentId,
        childVideoId,
        languageId,
        existingVariantId: null,
        action: 'create'
      })
      continue
    }
    if (hasRealMediaIndicators(existing)) {
      findings.push({
        parentId,
        childVideoId,
        languageId,
        existingVariantId: existing.id,
        action: 'ambiguous'
      })
      continue
    }
    if (needsNormalization(existing, parent.availableLanguages)) {
      findings.push({
        parentId,
        childVideoId,
        languageId,
        existingVariantId: existing.id,
        action: 'normalize'
      })
    }
  }
  return findings
}

async function normalizeParentVariant(
  finding: ParentLanguageFinding
): Promise<string> {
  if (finding.existingVariantId == null) {
    throw new Error('Cannot normalize a finding without an existing variant')
  }
  const variantId = finding.existingVariantId
  await prisma.$transaction(async (tx) => {
    await tx.videoVariant.update({
      where: { id: variantId },
      data: { published: true, downloadable: false }
    })
    const parent = await tx.video.findUnique({
      where: { id: finding.parentId },
      select: { availableLanguages: true }
    })
    if (
      parent != null &&
      !parent.availableLanguages.includes(finding.languageId)
    ) {
      await tx.video.update({
        where: { id: finding.parentId },
        data: {
          availableLanguages: [
            ...parent.availableLanguages,
            finding.languageId
          ]
        }
      })
    }
  })
  return variantId
}

async function indexParentVariant(
  parentId: string,
  variantId: string
): Promise<ParentLanguageIndexResult> {
  try {
    await updateVideoInAlgolia(parentId)
    await updateVideoVariantInAlgolia(variantId)
    return 'indexed'
  } catch {
    return 'indexFailed'
  }
}

// Audits one parent Video and, in apply mode, atomically creates or
// normalizes deterministic gaps and indexes the result. Ambiguous findings
// (an existing Variant with real media indicators) are always reported and
// never mutated.
export async function auditAndRepairParent(
  parentId: string,
  options: { apply: boolean }
): Promise<ParentLanguageAuditEntry[]> {
  const findings = await findParentLanguageFindings(parentId)
  const entries: ParentLanguageAuditEntry[] = []

  for (const finding of findings) {
    if (finding.action === 'ambiguous') {
      entries.push({
        ...finding,
        variantId: finding.existingVariantId,
        result: 'reported',
        indexResult: 'skipped'
      })
      continue
    }

    if (!options.apply) {
      entries.push({
        ...finding,
        variantId: finding.existingVariantId,
        result: 'proposed',
        indexResult: 'skipped'
      })
      continue
    }

    try {
      const variantId =
        finding.action === 'create'
          ? (await createEmptyParentVariant(finding.parentId, finding.languageId))
              .id
          : await normalizeParentVariant(finding)
      const indexResult = await indexParentVariant(finding.parentId, variantId)
      entries.push({
        ...finding,
        variantId,
        result: 'applied',
        indexResult
      })
    } catch (error) {
      entries.push({
        ...finding,
        variantId: finding.existingVariantId,
        result: 'failed',
        indexResult: 'skipped',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  return entries
}
