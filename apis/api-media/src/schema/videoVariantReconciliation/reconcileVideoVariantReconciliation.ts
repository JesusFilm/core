import { prisma } from '@core/prisma/media/client'

import { updateVideoVariantInAlgolia } from '../../lib/algolia/algoliaVideoVariantUpdate'
import {
  addLanguageToVideo,
  updateParentCollectionLanguages
} from '../video/lib/updateAvailableLanguages'

import { reconcileParentVariants } from './reconcileParentVariants'
import { reconcileReasonSpecificVariant } from './reconcileReasonSpecificVariant'
import {
  ProcessingStage,
  ProcessingStages,
  ReconciliationStatus,
  completedStage,
  failedStage,
  notApplicableStage,
  persistReconciliationStatus,
  previousAttempts,
  syncVideoRecordStage
} from './reconciliationStages'
import type { VideoVariantReconciliationReason } from './requestVideoVariantReconciliation'
import { videoVariantHasUsableMedia } from './videoVariantHasUsableMedia'

export type ReconciliationRecord = {
  reason: VideoVariantReconciliationReason
  videoId: string
  languageId: string
  videoVariantId: string | null
  published: boolean
  processingStages: unknown
  createdAt: Date
  videoVariant: {
    id: string
    videoId: string
    languageId: string
    slug: string
    published: boolean
    downloadable: boolean
    hls: string
    dash?: string | null
    share: string
    masterUrl?: string | null
    assetId?: string | null
    duration?: number | null
    muxVideo: { readyToStream: boolean } | null
    video?: { label: string } | null
  } | null
}

type ReconciliationPrisma = {
  videoVariantReconciliation: {
    findUniqueOrThrow: (args: {
      where: { id: string }
      include: { videoVariant: { include: { muxVideo: true; video: true } } }
    }) => Promise<ReconciliationRecord>
    updateMany: (args: {
      where: { id: string; createdAt: Date }
      data: {
        status: ReconciliationStatus
        processingStages: ProcessingStages
        retryAt: Date | null
        errorMessage: string | null
      }
    }) => Promise<unknown>
  }
}

export type VideoVariantReconciliationResult = {
  publicationReady: boolean
  status: ReconciliationStatus
}

export async function reconcileVideoVariantReconciliation(
  reconciliationId: string
): Promise<VideoVariantReconciliationResult> {
  const reconciliationPrisma = prisma as unknown as ReconciliationPrisma
  const reconciliation =
    await reconciliationPrisma.videoVariantReconciliation.findUniqueOrThrow({
      where: { id: reconciliationId },
      include: {
        videoVariant: { include: { muxVideo: true, video: true } }
      }
    })

  const variant = reconciliation.videoVariant
  const reasonSpecificResult = await reconcileReasonSpecificVariant({
    reconciliationId,
    reconciliation,
    variant,
    store: reconciliationPrisma
  })
  if (reasonSpecificResult != null) return reasonSpecificResult

  const hasUsableMedia = variant != null && videoVariantHasUsableMedia(variant)
  if (!hasUsableMedia) {
    const muxTimedOut =
      Date.now() - reconciliation.createdAt.getTime() >= 2 * 60 * 60 * 1000
    const muxStage: ProcessingStage = muxTimedOut
      ? failedStage('Mux did not produce a usable Variant within two hours')
      : {
          state: 'processing',
          attempts:
            previousAttempts(reconciliation.processingStages, 'mux') + 1,
          lastAttemptAt: new Date().toISOString()
        }
    const processingStages: ProcessingStages = {
      mux: muxStage,
      parentSync: { state: 'pending', attempts: 0 },
      downloads: { state: 'pending', attempts: 0 },
      algoliaVideo: { state: 'pending', attempts: 0 },
      algoliaVariant: { state: 'pending', attempts: 0 }
    }
    const status: ReconciliationStatus = muxTimedOut ? 'failed' : 'processing'
    // Same re-request guard as persistReconciliationStatus: a toggle made
    // while this run was reading must keep its own retryAt (now), not be
    // pushed back a whole sweep.
    await reconciliationPrisma.videoVariantReconciliation.updateMany({
      where: { id: reconciliationId, createdAt: reconciliation.createdAt },
      data: {
        status,
        processingStages,
        // The worker sweeps every 15 minutes (see config.ts `repeat`), so a
        // shorter retryAt here would not be honored -- align it with the
        // real cadence to avoid implying tighter polling than we provide.
        retryAt: muxTimedOut ? null : new Date(Date.now() + 15 * 60 * 1000),
        errorMessage: muxStage.error ?? null
      }
    })
    return { publicationReady: false, status }
  }

  const stages: ProcessingStages = {
    mux: completedStage(
      previousAttempts(reconciliation.processingStages, 'mux') + 1
    ),
    parentSync: completedStage(
      previousAttempts(reconciliation.processingStages, 'parentSync')
    ),
    downloads: notApplicableStage(),
    // Pre-incremented once for the whole run: `syncVideoRecordStage` may be
    // called more than once this run (a parent container, then this Video),
    // and each call stamps this same count rather than adding to it -- see
    // reconciliationStages.ts.
    algoliaVideo: completedStage(
      previousAttempts(reconciliation.processingStages, 'algoliaVideo') + 1
    ),
    algoliaVariant: {
      state: 'pending',
      attempts: previousAttempts(
        reconciliation.processingStages,
        'algoliaVariant'
      )
    }
  }

  const persistStatus = async (
    status: ReconciliationStatus,
    failedStageValue?: ProcessingStage
  ): Promise<void> => {
    await persistReconciliationStatus({
      store: reconciliationPrisma,
      reconciliationId,
      runCreatedAt: reconciliation.createdAt,
      status,
      stages,
      failedStageValue
    })
  }

  const parentResult = await reconcileParentVariants({
    variant,
    stages,
    persistStatus
  })
  if (parentResult != null) {
    return {
      publicationReady: parentResult.publicationReady,
      status: parentResult.status
    }
  }

  try {
    await addLanguageToVideo(variant.videoId, variant.languageId)
    await updateParentCollectionLanguages(variant.videoId)
  } catch (error) {
    stages.parentSync = failedStage(error, stages.parentSync.attempts + 1)
    await persistStatus('degraded', stages.parentSync)
    return { publicationReady: false, status: 'degraded' }
  }
  stages.algoliaVideo = await syncVideoRecordStage(
    variant.videoId,
    stages.algoliaVideo
  )

  const downloadCount = await prisma.videoVariantDownload.count({
    where: { videoVariantId: variant.id }
  })
  if (variant.downloadable && downloadCount === 0) {
    stages.downloads = failedStage('Requested Downloads are not ready')
  } else if (variant.downloadable) {
    stages.downloads = completedStage()
  }

  // The reconciliation row this sweep read at the top of the function can be
  // superseded by a newer request (e.g. an explicit Draft) while the
  // Algolia/parent-sync work above was in flight. Checking reconciliation.published
  // again here would still be a stale in-memory value, so gate the write on the
  // row's state at write time, in the same statement, instead of a read-then-write.
  if (reconciliation.published && !variant.published) {
    await prisma.$executeRaw`
      UPDATE "VideoVariant"
      SET published = true
      WHERE id = ${variant.id}
        AND published = false
        AND EXISTS (
          SELECT 1 FROM "VideoVariantReconciliation"
          WHERE "videoVariantId" = ${variant.id} AND published = true
        )
    `
  }
  try {
    await updateVideoVariantInAlgolia(variant.id)
    stages.algoliaVariant = completedStage(stages.algoliaVariant.attempts + 1)
  } catch (error) {
    // Deliberately no compensating rollback of `published` here: an editor
    // can explicitly unpublish and republish between the conditional UPDATE
    // above and this failure, and a rollback gated on this sweep's own state
    // cannot tell that fresh explicit write apart from the one it made itself.
    // Leaving `published` alone and retrying degraded until Algolia succeeds
    // avoids silently undoing an explicit action.
    stages.algoliaVariant = failedStage(
      error,
      stages.algoliaVariant.attempts + 1
    )
    await persistStatus('degraded', stages.algoliaVariant)
    return { publicationReady: false, status: 'degraded' }
  }

  // Downloads has its own 24h-bounded retry window, independent of
  // algoliaVideo's attempt-based backoff (retryAtFor). Compute it first so
  // that if both have failed this run, Downloads' still-open window takes
  // priority for retryAt -- otherwise an exhausted algoliaVideo backoff
  // (attempts >= 5, or a non-retryable error) would persist retryAt: null
  // and `dueRecordWhere` would never sweep this record again, silently
  // abandoning a Downloads retry that's still due.
  const retryDownloads =
    stages.downloads.state === 'failed' &&
    Date.now() - reconciliation.createdAt.getTime() < 24 * 60 * 60 * 1000

  // The Variant is published and indexed, but reconciliation isn't complete
  // until its Video record is too, so this keeps retrying. Whether it also
  // alerts depends on shouldAlertOnBlockedStages: an algoliaVideo-only
  // failure here is exactly the case that stays quiet by design.
  if (stages.algoliaVideo.state === 'failed') {
    await persistStatus(
      'degraded',
      retryDownloads ? stages.downloads : stages.algoliaVideo
    )
    return { publicationReady: false, status: 'degraded' }
  }

  const status = stages.downloads.state === 'failed' ? 'degraded' : 'complete'
  await persistStatus(status, retryDownloads ? stages.downloads : undefined)
  return { publicationReady: true, status }
}
