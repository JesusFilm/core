import { Prisma, prisma } from '@core/prisma/media/client'

import { createEmptyParentVariant } from '../../schema/videoVariant/videoVariant'
import { updateVideoInAlgolia } from '../algolia/algoliaVideoUpdate'
import { updateVideoVariantInAlgolia } from '../algolia/algoliaVideoVariantUpdate'

export type ParentLanguageAction = 'create' | 'normalize' | 'ambiguous'
export type ParentLanguageResult =
  | 'proposed'
  | 'applied'
  | 'failed'
  | 'reported'
export type ParentLanguageIndexResult = 'indexed' | 'indexFailed' | 'skipped'

// Reports the other reconstructable processing stages the PRD asks the
// audit to cover. This tool only repairs the parent-Variant stage; the rest
// are reported `unknown` rather than inferred or silently omitted -- deeper
// verification (a live Mux readiness check, a Download-completeness check,
// a standing Algolia-drift scan independent of any parent-Variant repair)
// is deferred to the phase 2/3 reconciliation pipeline. A standing scan for
// Video/Variant Algolia drift already exists via the Algolia reconciliation
// runner (checkAlgoliaVideoVariantIndexBatch, #9362).
export type ParentLanguageDiagnostics = {
  childVariantValidity: 'valid' | 'unknown'
  muxReadiness: 'ready' | 'unknown' | 'notApplicable'
  downloadsStatus: 'unknown'
  algoliaStatus: 'unknown'
}

export type ParentLanguageFinding = {
  parentId: string
  childVideoId: string
  languageId: string
  existingVariantId: string | null
  action: ParentLanguageAction
  diagnostics: ParentLanguageDiagnostics
}

export type ParentLanguageAuditEntry = ParentLanguageFinding & {
  variantId: string | null
  result: ParentLanguageResult
  indexResult: ParentLanguageIndexResult
  error?: string
}

const childVariantSelect = {
  languageId: true,
  videoId: true,
  hls: true,
  dash: true,
  muxVideoId: true,
  duration: true
} satisfies Prisma.VideoVariantSelect

type ChildVariantForRequirement = Prisma.VideoVariantGetPayload<{
  select: typeof childVariantSelect
}>

const parentVariantSelect = {
  id: true,
  languageId: true,
  hls: true,
  dash: true,
  muxVideoId: true,
  duration: true,
  published: true,
  downloadable: true,
  downloads: { select: { id: true }, take: 1 }
} satisfies Prisma.VideoVariantSelect

type ExistingParentVariant = Prisma.VideoVariantGetPayload<{
  select: typeof parentVariantSelect
}>

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

function diagnoseChildVariant(
  child: ChildVariantForRequirement
): ParentLanguageDiagnostics {
  const hasPlayableStream =
    (child.hls ?? '') !== '' || (child.dash ?? '') !== ''
  const childVariantValidity: ParentLanguageDiagnostics['childVariantValidity'] =
    hasPlayableStream || (child.duration ?? 0) > 0 ? 'valid' : 'unknown'
  const muxReadiness: ParentLanguageDiagnostics['muxReadiness'] =
    child.muxVideoId != null
      ? 'unknown'
      : hasPlayableStream
        ? 'notApplicable'
        : 'unknown'
  return {
    childVariantValidity,
    muxReadiness,
    downloadsStatus: 'unknown',
    algoliaStatus: 'unknown'
  }
}

// The single source of truth for "which parent languages does this Video
// require" -- one qualifying direct published child Variant in a language
// is sufficient. Shared by the single-parent parentVariantsOnly mutation
// mode (#9382) and the catalog-wide audit (#9468) so the invariant is
// defined once, not reimplemented per caller.
export async function getRequiredParentLanguages(parentId: string): Promise<
  Array<{
    languageId: string
    childVideoId: string
    diagnostics: ParentLanguageDiagnostics
  }>
> {
  const childVariants = await prisma.videoVariant.findMany({
    where: {
      published: true,
      video: { published: true, parents: { some: { id: parentId } } }
    },
    select: childVariantSelect
  })

  const requiredLanguages = new Map<string, ChildVariantForRequirement>()
  for (const child of childVariants) {
    if (!requiredLanguages.has(child.languageId)) {
      requiredLanguages.set(child.languageId, child)
    }
  }

  return [...requiredLanguages.values()].map((child) => ({
    languageId: child.languageId,
    childVideoId: child.videoId,
    diagnostics: diagnoseChildVariant(child)
  }))
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

  const [requiredLanguages, parentVariants] = await Promise.all([
    getRequiredParentLanguages(parentId),
    prisma.videoVariant.findMany({
      where: { videoId: parentId },
      select: parentVariantSelect
    })
  ])

  const parentVariantByLanguage = new Map(
    parentVariants.map((variant) => [variant.languageId, variant])
  )

  const findings: ParentLanguageFinding[] = []
  for (const { languageId, childVideoId, diagnostics } of requiredLanguages) {
    const existing = parentVariantByLanguage.get(languageId)
    if (existing == null) {
      findings.push({
        parentId,
        childVideoId,
        languageId,
        existingVariantId: null,
        action: 'create',
        diagnostics
      })
      continue
    }
    if (hasRealMediaIndicators(existing)) {
      findings.push({
        parentId,
        childVideoId,
        languageId,
        existingVariantId: existing.id,
        action: 'ambiguous',
        diagnostics
      })
      continue
    }
    if (needsNormalization(existing, parent.availableLanguages)) {
      findings.push({
        parentId,
        childVideoId,
        languageId,
        existingVariantId: existing.id,
        action: 'normalize',
        diagnostics
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
          availableLanguages: [...parent.availableLanguages, finding.languageId]
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
          ? (
              await createEmptyParentVariant(
                finding.parentId,
                finding.languageId
              )
            ).id
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
