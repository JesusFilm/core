import { prisma } from '@core/prisma/media/client'

import { updateVideoInAlgolia } from '../../lib/algolia/algoliaVideoUpdate'
import { updateVideoVariantInAlgolia } from '../../lib/algolia/algoliaVideoVariantUpdate'
import {
  addLanguageToVideo,
  updateParentCollectionLanguages
} from '../video/lib/updateAvailableLanguages'

import { reconcileParentVariants } from './reconcileParentVariants'
import { reconcileSourceSpecificVariant } from './reconcileSourceSpecificVariant'
import {
  ProcessingStage,
  ProcessingStages,
  ReconciliationStatus,
  completedStage,
  failedStage,
  notApplicableStage,
  persistReconciliationStatus,
  previousAttempts
} from './reconciliationStages'

type ReconciliationRecord = {
  source: string
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
    share: string
    muxVideo: { readyToStream: boolean } | null
  } | null
}

type ReconciliationPrisma = {
  videoVariantReconciliation: {
    findUniqueOrThrow: (args: {
      where: { id: string }
      include: { videoVariant: { include: { muxVideo: true; video: true } } }
    }) => Promise<ReconciliationRecord>
    update: (args: {
      where: { id: string }
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
  const sourceSpecificResult = await reconcileSourceSpecificVariant({
    reconciliationId,
    reconciliation,
    variant,
    store: reconciliationPrisma
  })
  if (sourceSpecificResult != null) return sourceSpecificResult

  const hasUsableMedia =
    variant != null &&
    (variant.muxVideo?.readyToStream === true ||
      Boolean(variant.hls) ||
      Boolean(variant.share))
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
    await reconciliationPrisma.videoVariantReconciliation.update({
      where: { id: reconciliationId },
      data: {
        status,
        processingStages,
        retryAt: muxTimedOut ? null : new Date(Date.now() + 60_000),
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
    algoliaVideo: completedStage(
      previousAttempts(reconciliation.processingStages, 'algoliaVideo')
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
  if (parentResult != null) return parentResult

  try {
    await addLanguageToVideo(variant.videoId, variant.languageId)
    await updateParentCollectionLanguages(variant.videoId)
    await updateVideoInAlgolia(variant.videoId)
    stages.algoliaVideo = completedStage(stages.algoliaVideo.attempts + 1)
  } catch (error) {
    stages.algoliaVideo = failedStage(error, stages.algoliaVideo.attempts + 1)
    await persistStatus('degraded', stages.algoliaVideo)
    return { publicationReady: false, status: 'degraded' }
  }

  const downloadCount = await prisma.videoVariantDownload.count({
    where: { videoVariantId: variant.id }
  })
  if (variant.downloadable && downloadCount === 0) {
    stages.downloads = failedStage('Requested Downloads are not ready')
  } else if (variant.downloadable) {
    stages.downloads = completedStage()
  }

  if (reconciliation.published && !variant.published) {
    await prisma.videoVariant.update({
      where: { id: variant.id },
      data: { published: true }
    })
  }
  try {
    await updateVideoVariantInAlgolia(variant.id)
    stages.algoliaVariant = completedStage(stages.algoliaVariant.attempts + 1)
  } catch (error) {
    stages.algoliaVariant = failedStage(
      error,
      stages.algoliaVariant.attempts + 1
    )
    if (reconciliation.published && !variant.published) {
      await prisma.videoVariant.update({
        where: { id: variant.id },
        data: { published: false }
      })
    }
    await persistStatus('degraded', stages.algoliaVariant)
    return { publicationReady: false, status: 'degraded' }
  }

  const status = stages.downloads.state === 'failed' ? 'degraded' : 'complete'
  const retryDownloads =
    stages.downloads.state === 'failed' &&
    Date.now() - reconciliation.createdAt.getTime() < 24 * 60 * 60 * 1000
  await persistStatus(status, retryDownloads ? stages.downloads : undefined)
  return { publicationReady: true, status }
}
