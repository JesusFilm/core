import { prisma } from '@core/prisma/media/client'

import { logger } from '../logger'
import { videoCacheReset, videoVariantCacheReset } from '../lib/videoCacheReset'
import { enqueueVideoAlgoliaSync } from '../workers/videoAlgoliaSync'
import { queue } from '../workers/videoAlgoliaSync/queue'

import { hasFlag } from './cliFlags'

/**
 * One-off production data fix for JesusFilm/core#10167, approved by Tanner:
 *
 *  A. Set the English (529) Variant of 9_CreationtoChristFull to
 *     downloadable = true (both English download URLs serve MP4s).
 *  B. Change the label of 13_0-RPGospel0401 ("Gospel Part 1 - Genesis") from
 *     series to episode. It is a single video with no children whose
 *     stream and download URLs work.
 *
 * Dry-run by default; pass --apply to write. Nothing is written unless BOTH
 * records currently hold the expected values (false / series) and the video
 * has no children, and the writes are guarded by those same conditions
 * inside one transaction. After a successful write it triggers the same
 * Algolia sync and cache resets the videoVariantUpdate / videoUpdate
 * mutations do.
 */

export const CREATION_TO_CHRIST_VIDEO_ID = '9_CreationtoChristFull'
export const GOSPEL_VIDEO_ID = '13_0-RPGospel0401'
export const ENGLISH_LANGUAGE_ID = '529'

export interface VariantState {
  id: string
  downloadable: boolean
}

export interface GospelState {
  label: string
  childIds: string[]
  childCount: number
}

export interface Plan {
  variant: { id: string; before: boolean; after: true }
  gospel: { before: 'series'; after: 'episode' }
}

export function buildPlan(
  variants: VariantState[],
  gospel: GospelState | null
): { plan: Plan } | { problems: string[] } {
  const problems: string[] = []

  if (variants.length !== 1) {
    problems.push(
      `${CREATION_TO_CHRIST_VIDEO_ID}: expected exactly 1 English (${ENGLISH_LANGUAGE_ID}) variant, found ${variants.length}`
    )
  } else if (variants[0].downloadable !== false) {
    problems.push(
      `${CREATION_TO_CHRIST_VIDEO_ID}: English variant ${variants[0].id} downloadable is ${String(variants[0].downloadable)}, expected false`
    )
  }

  if (gospel == null) {
    problems.push(`${GOSPEL_VIDEO_ID}: video not found`)
  } else {
    if (gospel.label !== 'series') {
      problems.push(
        `${GOSPEL_VIDEO_ID}: label is ${gospel.label}, expected series`
      )
    }
    if (gospel.childIds.length > 0 || gospel.childCount > 0) {
      problems.push(
        `${GOSPEL_VIDEO_ID}: has children (childIds=${gospel.childIds.length}, children=${gospel.childCount}); refusing to relabel`
      )
    }
  }

  if (problems.length > 0) return { problems }

  return {
    plan: {
      variant: { id: variants[0].id, before: false, after: true },
      gospel: { before: 'series', after: 'episode' }
    }
  }
}

async function loadState(): Promise<{
  variants: VariantState[]
  gospel: GospelState | null
}> {
  const variants = await prisma.videoVariant.findMany({
    where: {
      videoId: CREATION_TO_CHRIST_VIDEO_ID,
      languageId: ENGLISH_LANGUAGE_ID
    },
    select: { id: true, downloadable: true }
  })

  const gospelVideo = await prisma.video.findUnique({
    where: { id: GOSPEL_VIDEO_ID },
    select: {
      label: true,
      childIds: true,
      _count: { select: { children: true } }
    }
  })

  return {
    variants,
    gospel:
      gospelVideo == null
        ? null
        : {
            label: gospelVideo.label,
            childIds: gospelVideo.childIds,
            childCount: gospelVideo._count.children
          }
  }
}

async function applyPlan(plan: Plan): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Re-assert the expected values in the WHERE clause so a concurrent edit
    // between the read above and this write makes the update match nothing
    // (and the transaction roll back) instead of overwriting it.
    const variantResult = await tx.videoVariant.updateMany({
      where: { id: plan.variant.id, downloadable: false },
      data: { downloadable: true }
    })
    if (variantResult.count !== 1) {
      throw new Error(
        `variant ${plan.variant.id} changed since it was read; nothing written`
      )
    }

    const videoResult = await tx.video.updateMany({
      where: {
        id: GOSPEL_VIDEO_ID,
        label: 'series',
        childIds: { isEmpty: true },
        children: { none: {} }
      },
      data: { label: 'episode' }
    })
    if (videoResult.count !== 1) {
      throw new Error(
        `${GOSPEL_VIDEO_ID} changed since it was read; nothing written`
      )
    }
  })
}

// Mirrors the sync the mutations perform after their write.
async function syncAfterApply(plan: Plan): Promise<void> {
  // videoVariantUpdate: re-index the one dirty variant plus the video record.
  await enqueueVideoAlgoliaSync(
    CREATION_TO_CHRIST_VIDEO_ID,
    {
      syncVideoRecord: true,
      syncAllVariants: false,
      syncPublishedFlag: false,
      dirtyVariantIds: [plan.variant.id],
      deletedVariantIds: []
    },
    logger
  )
  // videoUpdate: label is embedded in every variant's Algolia record, so all
  // of this video's variants must be re-indexed.
  await enqueueVideoAlgoliaSync(
    GOSPEL_VIDEO_ID,
    {
      syncVideoRecord: true,
      syncAllVariants: true,
      syncPublishedFlag: false,
      dirtyVariantIds: [],
      deletedVariantIds: []
    },
    logger
  )

  await videoVariantCacheReset(plan.variant.id)
  await videoCacheReset(CREATION_TO_CHRIST_VIDEO_ID)
  await videoCacheReset(GOSPEL_VIDEO_ID)
}

/**
 * Returns the process exit code: 0 for a dry run or a successful apply,
 * 1 when a precondition fails or the write fails.
 */
export async function run(apply: boolean): Promise<number> {
  logger.info(
    `Creation to Christ / Gospel data fix starting (${apply ? 'APPLY' : 'dry-run'} mode)`
  )

  const { variants, gospel } = await loadState()
  const result = buildPlan(variants, gospel)

  if ('problems' in result) {
    for (const problem of result.problems) logger.error(problem)
    logger.error('Preconditions not met; nothing written')
    return 1
  }

  const { plan } = result
  logger.info(
    `A. ${CREATION_TO_CHRIST_VIDEO_ID} English variant ${plan.variant.id}: downloadable ${String(plan.variant.before)} -> ${String(plan.variant.after)}`
  )
  logger.info(
    `B. ${GOSPEL_VIDEO_ID} label: ${plan.gospel.before} -> ${plan.gospel.after} (0 children confirmed)`
  )

  if (!apply) {
    logger.info('Dry run only. Re-run with --apply to write these changes.')
    return 0
  }

  await applyPlan(plan)
  logger.info('Written. Triggering Algolia sync and cache resets')
  await syncAfterApply(plan)

  const after = await loadState()
  logger.info(
    `After: variant ${plan.variant.id} downloadable=${String(after.variants[0]?.downloadable)}; ${GOSPEL_VIDEO_ID} label=${after.gospel?.label}`
  )
  return 0
}

async function main(): Promise<void> {
  try {
    process.exitCode = await run(hasFlag(process.argv, 'apply'))
  } catch (error) {
    logger.error({ error }, 'Script failed')
    process.exitCode = 1
  } finally {
    await queue.close()
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  void main()
}
