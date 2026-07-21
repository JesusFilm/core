import { prisma } from '@core/prisma/media/client'

import { updateVideoInAlgolia } from '../../lib/algolia/algoliaVideoUpdate'
import { updateVideoVariantInAlgolia } from '../../lib/algolia/algoliaVideoVariantUpdate'
import {
  addLanguageToVideo,
  removeLanguageFromVideoIfUnused,
  updateParentCollectionLanguages
} from '../video/lib/updateAvailableLanguages'

type ReconciliationUpload = {
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
  videoVariantUpload: {
    findUniqueOrThrow: (args: {
      where: { id: string }
      include: { videoVariant: { include: { muxVideo: true; video: true } } }
    }) => Promise<ReconciliationUpload>
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

type ProcessingStageState =
  | 'pending'
  | 'processing'
  | 'complete'
  | 'failed'
  | 'unknown'
  | 'notApplicable'

type ProcessingStage = {
  state: ProcessingStageState
  attempts: number
  error?: string
  lastAttemptAt?: string
  lastSuccessAt?: string
}

type ProcessingStages = {
  mux: ProcessingStage
  parentSync: ProcessingStage
  downloads: ProcessingStage
  algoliaVideo: ProcessingStage
  algoliaVariant: ProcessingStage
}

type ReconciliationStatus = 'processing' | 'complete' | 'degraded' | 'failed'

export type VideoVariantReconciliationResult = {
  publicationReady: boolean
  status: ReconciliationStatus
}

function completedStage(attempts = 1): ProcessingStage {
  const timestamp = new Date().toISOString()
  return {
    state: 'complete',
    attempts,
    lastAttemptAt: timestamp,
    lastSuccessAt: timestamp
  }
}

function failedStage(error: unknown, attempts = 1): ProcessingStage {
  return {
    state: 'failed',
    attempts,
    error: error instanceof Error ? error.message : String(error),
    lastAttemptAt: new Date().toISOString()
  }
}

function notApplicableStage(): ProcessingStage {
  return { state: 'notApplicable', attempts: 0 }
}

function previousAttempts(processingStages: unknown, stage: string): number {
  if (
    processingStages == null ||
    typeof processingStages !== 'object' ||
    !(stage in processingStages)
  ) {
    return 0
  }
  const value = (processingStages as Record<string, unknown>)[stage]
  if (value == null || typeof value !== 'object') return 0
  const attempts = (value as Record<string, unknown>).attempts
  return typeof attempts === 'number' ? attempts : 0
}

function retryAtFor(attempts: number): Date | null {
  if (attempts >= 5) return null
  const delayMinutes = 2 ** Math.max(0, attempts - 1)
  return new Date(Date.now() + delayMinutes * 60_000)
}

function containsMedia(variant: {
  hls?: string | null
  dash?: string | null
  share?: string | null
  masterUrl?: string | null
  duration?: number | null
  muxVideoId?: string | null
  assetId?: string | null
  downloads?: unknown[]
}): boolean {
  return (
    Boolean(variant.hls) ||
    Boolean(variant.dash) ||
    Boolean(variant.share) ||
    Boolean(variant.masterUrl) ||
    Boolean(variant.muxVideoId) ||
    Boolean(variant.assetId) ||
    (variant.duration ?? 0) > 0 ||
    (variant.downloads?.length ?? 0) > 0
  )
}

export async function reconcileVideoVariantUpload(
  uploadId: string
): Promise<VideoVariantReconciliationResult> {
  const reconciliationPrisma = prisma as unknown as ReconciliationPrisma
  const upload =
    await reconciliationPrisma.videoVariantUpload.findUniqueOrThrow({
      where: { id: uploadId },
      include: {
        videoVariant: { include: { muxVideo: true, video: true } }
      }
    })

  const variant = upload.videoVariant
  if (upload.source === 'video-variant-delete') {
    await removeLanguageFromVideoIfUnused(upload.videoId, upload.languageId)
    await updateParentCollectionLanguages(upload.videoId)
    await updateVideoInAlgolia(upload.videoId)
    if (upload.videoVariantId != null) {
      await updateVideoVariantInAlgolia(upload.videoVariantId)
    }
    const processingStages: ProcessingStages = {
      mux: notApplicableStage(),
      parentSync: completedStage(),
      downloads: notApplicableStage(),
      algoliaVideo: completedStage(),
      algoliaVariant: completedStage()
    }
    await reconciliationPrisma.videoVariantUpload.update({
      where: { id: uploadId },
      data: {
        status: 'complete',
        processingStages,
        retryAt: null,
        errorMessage: null
      }
    })
    return { publicationReady: true, status: 'complete' }
  }
  if (
    variant != null &&
    ['generated-parent', 'backfill-generated-parent'].includes(upload.source)
  ) {
    const stages: ProcessingStages = {
      mux: notApplicableStage(),
      parentSync: completedStage(
        previousAttempts(upload.processingStages, 'parentSync') + 1
      ),
      downloads: notApplicableStage(),
      algoliaVideo: {
        state: 'pending',
        attempts: previousAttempts(upload.processingStages, 'algoliaVideo')
      },
      algoliaVariant: {
        state: 'pending',
        attempts: previousAttempts(upload.processingStages, 'algoliaVariant')
      }
    }

    const persistGeneratedStatus = async (
      status: ReconciliationStatus,
      failedStageValue?: ProcessingStage
    ): Promise<void> => {
      await reconciliationPrisma.videoVariantUpload.update({
        where: { id: uploadId },
        data: {
          status,
          processingStages: stages,
          retryAt:
            failedStageValue != null
              ? retryAtFor(failedStageValue.attempts)
              : null,
          errorMessage: failedStageValue?.error ?? null
        }
      })
    }

    try {
      await updateVideoInAlgolia(variant.videoId)
      stages.algoliaVideo = completedStage(stages.algoliaVideo.attempts + 1)
    } catch (error) {
      stages.algoliaVideo = failedStage(error, stages.algoliaVideo.attempts + 1)
      await persistGeneratedStatus('degraded', stages.algoliaVideo)
      return { publicationReady: false, status: 'degraded' }
    }

    try {
      if (!variant.published) {
        await prisma.videoVariant.update({
          where: { id: variant.id },
          data: { published: true }
        })
      }
      await updateVideoVariantInAlgolia(variant.id)
      stages.algoliaVariant = completedStage(stages.algoliaVariant.attempts + 1)
    } catch (error) {
      if (!variant.published) {
        await prisma.videoVariant.update({
          where: { id: variant.id },
          data: { published: false }
        })
      }
      stages.algoliaVariant = failedStage(
        error,
        stages.algoliaVariant.attempts + 1
      )
      await persistGeneratedStatus('degraded', stages.algoliaVariant)
      return { publicationReady: false, status: 'degraded' }
    }

    await persistGeneratedStatus('complete')
    return { publicationReady: true, status: 'complete' }
  }

  if (variant != null && !upload.published) {
    await prisma.videoVariant.update({
      where: { id: variant.id },
      data: { published: false }
    })
    await removeLanguageFromVideoIfUnused(variant.videoId, variant.languageId)
    await updateParentCollectionLanguages(variant.videoId)
    await updateVideoInAlgolia(variant.videoId)
    await updateVideoVariantInAlgolia(variant.id)
    const processingStages: ProcessingStages = {
      mux:
        variant.muxVideo?.readyToStream === true
          ? completedStage()
          : notApplicableStage(),
      parentSync: completedStage(),
      downloads: notApplicableStage(),
      algoliaVideo: completedStage(),
      algoliaVariant: completedStage()
    }
    await reconciliationPrisma.videoVariantUpload.update({
      where: { id: uploadId },
      data: {
        status: 'complete',
        processingStages,
        retryAt: null,
        errorMessage: null
      }
    })
    return { publicationReady: true, status: 'complete' }
  }

  const hasUsableMedia =
    variant != null &&
    (variant.muxVideo?.readyToStream === true ||
      Boolean(variant.hls) ||
      Boolean(variant.share))
  if (!hasUsableMedia) {
    const muxTimedOut =
      Date.now() - upload.createdAt.getTime() >= 2 * 60 * 60 * 1000
    const muxStage: ProcessingStage = muxTimedOut
      ? failedStage('Mux did not produce a usable Variant within two hours')
      : {
          state: 'processing',
          attempts: previousAttempts(upload.processingStages, 'mux') + 1,
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
    await reconciliationPrisma.videoVariantUpload.update({
      where: { id: uploadId },
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
    mux: completedStage(previousAttempts(upload.processingStages, 'mux') + 1),
    parentSync: completedStage(
      previousAttempts(upload.processingStages, 'parentSync')
    ),
    downloads: notApplicableStage(),
    algoliaVideo: completedStage(
      previousAttempts(upload.processingStages, 'algoliaVideo')
    ),
    algoliaVariant: {
      state: 'pending',
      attempts: previousAttempts(upload.processingStages, 'algoliaVariant')
    }
  }

  const persistStatus = async (
    status: ReconciliationStatus,
    failedStageValue?: ProcessingStage
  ): Promise<void> => {
    await reconciliationPrisma.videoVariantUpload.update({
      where: { id: uploadId },
      data: {
        status,
        processingStages: stages,
        retryAt:
          failedStageValue != null
            ? retryAtFor(failedStageValue.attempts)
            : null,
        errorMessage: failedStageValue?.error ?? null
      }
    })
  }

  const parentVideos = await prisma.video.findMany({
    where: { childIds: { has: variant.videoId } },
    select: { id: true, slug: true, availableLanguages: true }
  })

  for (const parentVideo of parentVideos) {
    const parentVariantId = `${variant.languageId}_${parentVideo.id}`
    const parentStatusId = `status_${parentVariantId}`
    const parentVariant = await prisma.videoVariant.findFirst({
      where: {
        videoId: parentVideo.id,
        languageId: variant.languageId
      },
      include: { downloads: { select: { id: true } } }
    })

    if (parentVariant != null && containsMedia(parentVariant)) {
      stages.parentSync = failedStage(
        `Parent Variant ${parentVariant.id} contains media and requires operator review`,
        stages.parentSync.attempts + 1
      )
      await persistStatus('degraded', stages.parentSync)
      return { publicationReady: false, status: 'degraded' }
    }

    try {
      if (parentVariant == null) {
        const languageSlug =
          variant.slug?.split('/').filter(Boolean).at(-1) ?? variant.languageId
        await prisma.$transaction(async (transaction) => {
          await transaction.videoVariant.create({
            data: {
              id: parentVariantId,
              videoId: parentVideo.id,
              languageId: variant.languageId,
              edition: 'base',
              slug: `${parentVideo.slug ?? parentVideo.id}/${languageSlug}`,
              hls: '',
              dash: '',
              share: '',
              published: false,
              downloadable: false,
              duration: 0,
              lengthInMilliseconds: 0
            }
          })
          await transaction.videoVariantUpload.create({
            data: {
              id: parentStatusId,
              source: 'generated-parent',
              status: 'processing',
              canonical: true,
              videoId: parentVideo.id,
              languageId: variant.languageId,
              published: true,
              videoVariantId: parentVariantId,
              processingStages: {
                mux: { state: 'notApplicable', attempts: 0 },
                parentSync: { state: 'complete', attempts: 1 },
                downloads: { state: 'notApplicable', attempts: 0 },
                algoliaVideo: { state: 'pending', attempts: 0 },
                algoliaVariant: { state: 'pending', attempts: 0 }
              }
            }
          })
          await transaction.video.update({
            where: { id: parentVideo.id },
            data: {
              availableLanguages: Array.from(
                new Set([...parentVideo.availableLanguages, variant.languageId])
              )
            }
          })
        })
      } else {
        await prisma.video.update({
          where: { id: parentVideo.id },
          data: {
            availableLanguages: Array.from(
              new Set([...parentVideo.availableLanguages, variant.languageId])
            )
          }
        })
      }
      stages.parentSync = completedStage(stages.parentSync.attempts + 1)
    } catch (error) {
      stages.parentSync = failedStage(error, stages.parentSync.attempts + 1)
      await persistStatus('degraded', stages.parentSync)
      return { publicationReady: false, status: 'degraded' }
    }

    try {
      await updateVideoInAlgolia(parentVideo.id)
      stages.algoliaVideo = completedStage(stages.algoliaVideo.attempts + 1)
    } catch (error) {
      stages.algoliaVideo = failedStage(error, stages.algoliaVideo.attempts + 1)
      await persistStatus('degraded', stages.algoliaVideo)
      return { publicationReady: false, status: 'degraded' }
    }

    try {
      if (parentVariant == null) {
        await prisma.videoVariant.update({
          where: { id: parentVariantId },
          data: { published: true }
        })
      }
      await updateVideoVariantInAlgolia(parentVariant?.id ?? parentVariantId)
      if (parentVariant == null) {
        await prisma.videoVariantUpload.update({
          where: { id: parentStatusId },
          data: {
            status: 'complete',
            retryAt: null,
            errorMessage: null,
            processingStages: {
              mux: { state: 'notApplicable', attempts: 0 },
              parentSync: { state: 'complete', attempts: 1 },
              downloads: { state: 'notApplicable', attempts: 0 },
              algoliaVideo: { state: 'complete', attempts: 1 },
              algoliaVariant: { state: 'complete', attempts: 1 }
            }
          }
        })
      }
    } catch (error) {
      if (parentVariant == null) {
        await prisma.videoVariant.update({
          where: { id: parentVariantId },
          data: { published: false }
        })
      }
      stages.algoliaVariant = failedStage(
        error,
        stages.algoliaVariant.attempts + 1
      )
      await persistStatus('degraded', stages.algoliaVariant)
      return { publicationReady: false, status: 'degraded' }
    }
  }

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

  if (upload.published && !variant.published) {
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
    if (upload.published && !variant.published) {
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
    Date.now() - upload.createdAt.getTime() < 24 * 60 * 60 * 1000
  await persistStatus(status, retryDownloads ? stages.downloads : undefined)
  return { publicationReady: true, status }
}
