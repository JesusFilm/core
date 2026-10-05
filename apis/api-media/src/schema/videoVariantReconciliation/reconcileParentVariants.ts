import { prisma } from '@core/prisma/media/client'

import { updateVideoInAlgolia } from '../../lib/algolia/algoliaVideoUpdate'
import { updateVideoVariantInAlgolia } from '../../lib/algolia/algoliaVideoVariantUpdate'
import { videoCacheReset } from '../../lib/videoCacheReset'
import {
  addLanguageToVideo,
  findContainerParentIds,
  updateParentCollectionLanguages
} from '../video/lib/updateAvailableLanguages'

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
  // Use the same parent-lookup as the rest of the availableLanguages machinery
  // (findContainerParentIds) so this only ever picks up container videos —
  // collections, series, featureFilms — rather than every video that happens
  // to list variant.videoId in its (separately-maintained) childIds array.
  const parentIds = await findContainerParentIds(variant.videoId)
  if (parentIds.length === 0) return null

  const parentVideos = await prisma.video.findMany({
    where: { id: { in: parentIds } },
    select: { id: true, slug: true }
  })

  let firstFailure: ParentReconciliationResult | null = null
  for (const parentVideo of parentVideos) {
    const failure = await reconcileParentVariant({
      parentVideo,
      variant,
      stages,
      persistStatus
    })
    if (failure != null && firstFailure == null) firstFailure = failure
  }

  return firstFailure
}

async function reconcileParentVariant({
  parentVideo,
  variant,
  stages,
  persistStatus
}: {
  parentVideo: { id: string; slug: string | null }
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
      })
    }

    // Route the parent-language write through the canonical, cache-revalidating
    // path (used everywhere else availableLanguages is mutated) instead of
    // writing the field by hand. addLanguageToVideo sets the language on this
    // parent directly (parentVideo's own children aren't fully in sync yet, so
    // a recalculation-based update would drop it); updateParentCollectionLanguages
    // cascades the change to any further-up container (nested collections);
    // videoCacheReset is what actually revalidates the watch-app language menu
    // for this parent's own page (VMT-318).
    await addLanguageToVideo(parentVideo.id, variant.languageId)
    await updateParentCollectionLanguages(parentVideo.id)
    await videoCacheReset(parentVideo.id)
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
