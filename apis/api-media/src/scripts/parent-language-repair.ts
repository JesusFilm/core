import { prisma } from '@core/prisma/media/client'

import { updateVideoInAlgolia } from '../lib/algolia/algoliaVideoUpdate'
import { updateVideoVariantInAlgolia } from '../lib/algolia/algoliaVideoVariantUpdate'
import { videoVariantContainsMedia } from '../schema/videoVariantReconciliation/videoVariantContainsMedia'
import { createEmptyParentVariant } from '../schema/videoVariant/videoVariant'

import type { ParentVariantAuditEntry } from './audit-parent-variants'

export type PendingIndexRetry = {
  parentVideoId: string
  childVideoId: string
  languageId: string
  variantId: string
  action: ParentVariantAuditEntry['action']
}

export type ParentLanguageRepairOutcome = {
  parentVideoId: string
  childVideoId: string
  languageId: string
  variantId: string
  action: ParentVariantAuditEntry['action']
  result: 'repaired' | 'indexIncomplete' | 'failed'
  error?: string
}

export type ParentLanguageRepairSummary = {
  applied: boolean
  repaired: ParentLanguageRepairOutcome[]
  indexIncomplete: ParentLanguageRepairOutcome[]
  failed: ParentLanguageRepairOutcome[]
  pendingIndexRetries: PendingIndexRetry[]
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function toPendingRetry(
  entry: Pick<
    ParentLanguageRepairOutcome,
    'parentVideoId' | 'childVideoId' | 'languageId' | 'variantId' | 'action'
  >
): PendingIndexRetry {
  return {
    parentVideoId: entry.parentVideoId,
    childVideoId: entry.childVideoId,
    languageId: entry.languageId,
    variantId: entry.variantId,
    action: entry.action
  }
}

// Reindexes a repaired parent Video and Variant in Algolia. Both writer
// functions throw on failure (unlike the queue-based enqueueVideoAlgoliaSync),
// so a failure here is observable to the caller instead of silently swallowed.
async function indexRepairedParentVariant(
  parentVideoId: string,
  variantId: string
): Promise<void> {
  await updateVideoInAlgolia(parentVideoId)
  await updateVideoVariantInAlgolia(variantId)
}

// Performs the database write for a single deterministic gap. Reuses
// createEmptyParentVariant for creation (the same helper the parentVariantsOnly
// publish mode uses) rather than reimplementing parent-Variant creation again.
// For a gap on an existing, non-media Variant, re-checks media-bearing status
// at write time (not just at audit time) so a Variant that gained real media
// between the dry-run scan and the apply pass is still refused, never overwritten.
async function writeParentLanguageRepair(
  gap: ParentVariantAuditEntry
): Promise<string> {
  if (gap.action === 'createGeneratedParentVariant') {
    const variant = await createEmptyParentVariant(
      gap.parentVideoId,
      gap.languageId
    )
    return variant.id
  }

  const [parent, variant] = await Promise.all([
    prisma.video.findUnique({
      where: { id: gap.parentVideoId },
      select: { availableLanguages: true }
    }),
    prisma.videoVariant.findUnique({
      where: { id: gap.variantId },
      include: { downloads: { select: { id: true } } }
    })
  ])

  if (parent == null) {
    throw new Error(`Parent Video ${gap.parentVideoId} no longer exists`)
  }
  if (variant == null) {
    throw new Error(`Parent Variant ${gap.variantId} no longer exists`)
  }
  if (videoVariantContainsMedia(variant)) {
    throw new Error(
      `Parent Variant ${variant.id} now contains media; refusing to overwrite`
    )
  }

  const updates: Array<Promise<unknown>> = []
  if (!parent.availableLanguages.includes(gap.languageId)) {
    updates.push(
      prisma.video.update({
        where: { id: gap.parentVideoId },
        data: {
          availableLanguages: {
            set: [...parent.availableLanguages, gap.languageId]
          }
        }
      })
    )
  }
  if (!variant.published) {
    updates.push(
      prisma.videoVariant.update({
        where: { id: variant.id },
        data: { published: true }
      })
    )
  }
  await Promise.all(updates)

  return variant.id
}

/**
 * Applies deterministic parent-language gaps found by auditParentVariants,
 * plus any Variants left over from a prior run whose database repair
 * succeeded but whose indexing did not.
 *
 * Dry run (apply: false) is a pure passthrough: nothing is written, nothing is
 * indexed, and any pendingIndexRetries handed in are returned unchanged so the
 * caller never mistakes a dry run for having cleared them.
 *
 * A repair is not "repaired" until it is indexed. When the database write
 * succeeds but indexing fails, the database change is kept (it is idempotent
 * and safe to leave in place) and the entry is reported as indexIncomplete
 * plus carried forward in pendingIndexRetries for the caller to retry on a
 * later run — without repeating the database write.
 */
export async function applyParentLanguageRepairs(
  gaps: ParentVariantAuditEntry[],
  options: { apply: boolean; pendingIndexRetries?: PendingIndexRetry[] }
): Promise<ParentLanguageRepairSummary> {
  if (!options.apply) {
    return {
      applied: false,
      repaired: [],
      indexIncomplete: [],
      failed: [],
      pendingIndexRetries: options.pendingIndexRetries ?? []
    }
  }

  const repaired: ParentLanguageRepairOutcome[] = []
  const indexIncomplete: ParentLanguageRepairOutcome[] = []
  const failed: ParentLanguageRepairOutcome[] = []

  for (const gap of gaps) {
    const base = {
      parentVideoId: gap.parentVideoId,
      childVideoId: gap.childVideoId,
      languageId: gap.languageId,
      action: gap.action
    }

    let variantId: string
    try {
      variantId = await writeParentLanguageRepair(gap)
    } catch (error) {
      failed.push({ ...base, variantId: gap.variantId, result: 'failed', error: errorMessage(error) })
      continue
    }

    try {
      await indexRepairedParentVariant(gap.parentVideoId, variantId)
      repaired.push({ ...base, variantId, result: 'repaired' })
    } catch (error) {
      indexIncomplete.push({
        ...base,
        variantId,
        result: 'indexIncomplete',
        error: errorMessage(error)
      })
    }
  }

  for (const retry of options.pendingIndexRetries ?? []) {
    try {
      await indexRepairedParentVariant(retry.parentVideoId, retry.variantId)
      repaired.push({ ...retry, result: 'repaired' })
    } catch (error) {
      indexIncomplete.push({
        ...retry,
        result: 'indexIncomplete',
        error: errorMessage(error)
      })
    }
  }

  return {
    applied: true,
    repaired,
    indexIncomplete,
    failed,
    pendingIndexRetries: indexIncomplete.map(toPendingRetry)
  }
}
