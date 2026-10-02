import { prisma } from '@core/prisma/media/client'

import { updateVideoInAlgolia } from '../lib/algolia/algoliaVideoUpdate'
import { updateVideoVariantInAlgolia } from '../lib/algolia/algoliaVideoVariantUpdate'
import { createEmptyParentVariant } from '../schema/videoVariant/videoVariant'
import { videoVariantContainsMedia } from '../schema/videoVariantReconciliation/videoVariantContainsMedia'

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

// Reindexes a repaired parent Video and Variant in Algolia. updateVideoInAlgolia
// throws on failure (unlike the queue-based enqueueVideoAlgoliaSync), so that
// failure is observable to the caller instead of silently swallowed.
// updateVideoVariantInAlgolia instead returns false when it deliberately skips
// the write (e.g. a missing Cloudflare image account) — that is turned into a
// throw here so the caller can't mistake a skipped index for a completed one.
async function indexRepairedParentVariant(
  parentVideoId: string,
  variantId: string
): Promise<void> {
  await updateVideoInAlgolia(parentVideoId)
  const variantIndexed = await updateVideoVariantInAlgolia(variantId)
  if (!variantIndexed) {
    throw new Error(
      `Algolia update for Variant ${variantId} was skipped (see logs for reason)`
    )
  }
}

// Performs the database write for a single deterministic gap. Reuses
// createEmptyParentVariant for creation (the same helper the parentVariantsOnly
// publish mode uses) rather than reimplementing parent-Variant creation again.
// createEmptyParentVariant returns an already-existing Variant as-is when one
// is found for the language, without checking media or availableLanguages, so
// every gap — however it resolved to a Variant id — is revalidated below:
// media-bearing status is re-checked at write time (not just at audit time),
// so a Variant that gained real media between the dry-run scan and the apply
// pass is still refused, never overwritten. The availableLanguages and
// published updates are only issued when needed, and run in a single
// transaction so the Video and Variant either both change or neither does.
async function writeParentLanguageRepair(
  gap: ParentVariantAuditEntry
): Promise<string> {
  const variantId =
    gap.action === 'createGeneratedParentVariant'
      ? (await createEmptyParentVariant(gap.parentVideoId, gap.languageId)).id
      : gap.variantId

  const [parent, variant] = await Promise.all([
    prisma.video.findUnique({
      where: { id: gap.parentVideoId },
      select: { availableLanguages: true }
    }),
    prisma.videoVariant.findUnique({
      where: { id: variantId },
      include: { downloads: { select: { id: true } } }
    })
  ])

  if (parent == null) {
    throw new Error(`Parent Video ${gap.parentVideoId} no longer exists`)
  }
  if (variant == null) {
    throw new Error(`Parent Variant ${variantId} no longer exists`)
  }
  if (videoVariantContainsMedia(variant)) {
    throw new Error(
      `Parent Variant ${variant.id} now contains media; refusing to overwrite`
    )
  }

  const needsLanguage = !parent.availableLanguages.includes(gap.languageId)
  const needsPublish = !variant.published

  if (needsLanguage || needsPublish) {
    await prisma.$transaction(async (tx) => {
      const updates: Array<Promise<unknown>> = []
      if (needsLanguage) {
        updates.push(
          tx.video.update({
            where: { id: gap.parentVideoId },
            data: {
              availableLanguages: {
                set: [...parent.availableLanguages, gap.languageId]
              }
            }
          })
        )
      }
      if (needsPublish) {
        updates.push(
          tx.videoVariant.update({
            where: { id: variant.id },
            data: { published: true }
          })
        )
      }
      await Promise.all(updates)
    })
  }

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
      failed.push({
        ...base,
        variantId: gap.variantId,
        result: 'failed',
        error: errorMessage(error)
      })
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
