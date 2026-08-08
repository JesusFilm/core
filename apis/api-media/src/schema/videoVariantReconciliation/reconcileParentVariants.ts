import { prisma } from '@core/prisma/media/client'

import { updateVideoInAlgolia } from '../../lib/algolia/algoliaVideoUpdate'
import { updateVideoVariantInAlgolia } from '../../lib/algolia/algoliaVideoVariantUpdate'

import { reconcileGeneratedParentVariant } from './reconcileReasonSpecificVariant'
import {
  ProcessingStage,
  ProcessingStages,
  ReconciliationStatus,
  completedStage,
  failedStage,
  generatedParentStages
} from './reconciliationStages'
import { videoVariantContainsMedia } from './videoVariantContainsMedia'

type ChildVariant = {
  id: string
  videoId: string
  languageId: string
  slug?: string
}

type ParentReconciliationResult = {
  publicationReady: false
  status: 'degraded'
}

export async function reconcileParentVariants({
  variant,
  stages,
  persistStatus
}: {
  variant: ChildVariant
  stages: ProcessingStages
  persistStatus: (
    status: ReconciliationStatus,
    failedStageValue?: ProcessingStage
  ) => Promise<void>
}): Promise<ParentReconciliationResult | null> {
  const parentVideos = await prisma.video.findMany({
    where: { childIds: { has: variant.videoId } },
    select: { id: true, slug: true, availableLanguages: true }
  })

  for (const parentVideo of parentVideos) {
    const failure = await reconcileParentVariant({
      parentVideo,
      variant,
      stages,
      persistStatus
    })
    if (failure != null) return failure
  }

  return null
}

async function reconcileParentVariant({
  parentVideo,
  variant,
  stages,
  persistStatus
}: {
  parentVideo: { id: string; slug: string | null; availableLanguages: string[] }
  variant: ChildVariant
  stages: ProcessingStages
  persistStatus: (
    status: ReconciliationStatus,
    failedStageValue?: ProcessingStage
  ) => Promise<void>
}): Promise<ParentReconciliationResult | null> {
  const parentVariantId = `${variant.languageId}_${parentVideo.id}`
  const parentReconciliationId = `status_${parentVariantId}`
  const generatedParentProcessingStages = generatedParentStages()
  const parentVariant = await prisma.videoVariant.findFirst({
    where: {
      videoId: parentVideo.id,
      languageId: variant.languageId
    },
    include: { downloads: { select: { id: true } } }
  })

  if (parentVariant != null && videoVariantContainsMedia(parentVariant)) {
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
        await transaction.videoVariantReconciliation.create({
          data: {
            id: parentReconciliationId,
            reason: 'generated-parent',
            status: 'processing',
            videoId: parentVideo.id,
            languageId: variant.languageId,
            published: true,
            videoVariantId: parentVariantId,
            processingStages: generatedParentProcessingStages
          }
        })
        await addParentLanguage(parentVideo, variant.languageId, transaction)
      })
    } else {
      await addParentLanguage(parentVideo, variant.languageId, prisma)
    }
    stages.parentSync = completedStage(stages.parentSync.attempts + 1)
  } catch (error) {
    stages.parentSync = failedStage(error, stages.parentSync.attempts + 1)
    await persistStatus('degraded', stages.parentSync)
    return { publicationReady: false, status: 'degraded' }
  }

  if (parentVariant == null) {
    const result = await reconcileGeneratedParentVariant({
      reconciliationId: parentReconciliationId,
      reconciliation: {
        reason: 'generated-parent',
        videoId: parentVideo.id,
        languageId: variant.languageId,
        videoVariantId: parentVariantId,
        published: true,
        processingStages: generatedParentProcessingStages
      },
      variant: {
        id: parentVariantId,
        videoId: parentVideo.id,
        languageId: variant.languageId,
        published: false,
        muxVideo: null
      },
      store: prisma
    })
    if (result.failure != null) {
      stages[result.failure.stageName] = result.failure.stage
      await persistStatus('degraded', result.failure.stage)
      return { publicationReady: false, status: 'degraded' }
    }
    return null
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
    await updateVideoVariantInAlgolia(parentVariant.id)
  } catch (error) {
    stages.algoliaVariant = failedStage(
      error,
      stages.algoliaVariant.attempts + 1
    )
    await persistStatus('degraded', stages.algoliaVariant)
    return { publicationReady: false, status: 'degraded' }
  }

  return null
}

async function addParentLanguage(
  parentVideo: { id: string; availableLanguages: string[] },
  languageId: string,
  client: Pick<typeof prisma, 'video'>
): Promise<void> {
  await client.video.update({
    where: { id: parentVideo.id },
    data: {
      availableLanguages: Array.from(
        new Set([...parentVideo.availableLanguages, languageId])
      )
    }
  })
}
