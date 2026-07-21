import { prisma } from '@core/prisma/media/client'

import { updateVideoInAlgolia } from '../../lib/algolia/algoliaVideoUpdate'
import { updateVideoVariantInAlgolia } from '../../lib/algolia/algoliaVideoVariantUpdate'
import {
  removeLanguageFromVideoIfUnused,
  updateParentCollectionLanguages
} from '../video/lib/updateAvailableLanguages'

import {
  ProcessingStages,
  ReconciliationStatus,
  ReconciliationStore,
  completedStage,
  failedStage,
  notApplicableStage,
  persistReconciliationStatus,
  previousAttempts
} from './reconciliationStages'

type SourceVariant = {
  id: string
  videoId: string
  languageId: string
  published: boolean
  muxVideo: { readyToStream: boolean } | null
}

type SourceReconciliation = {
  source: string
  videoId: string
  languageId: string
  videoVariantId: string | null
  published: boolean
  processingStages: unknown
}

export type SourceSpecificReconciliationResult = {
  publicationReady: boolean
  status: ReconciliationStatus
}

export async function reconcileSourceSpecificVariant({
  reconciliationId,
  reconciliation,
  variant,
  store
}: {
  reconciliationId: string
  reconciliation: SourceReconciliation
  variant: SourceVariant | null
  store: ReconciliationStore
}): Promise<SourceSpecificReconciliationResult | null> {
  if (reconciliation.source === 'video-variant-delete') {
    await removeLanguageFromVideoIfUnused(
      reconciliation.videoId,
      reconciliation.languageId
    )
    await updateParentCollectionLanguages(reconciliation.videoId)
    await updateVideoInAlgolia(reconciliation.videoId)
    if (reconciliation.videoVariantId != null) {
      await updateVideoVariantInAlgolia(reconciliation.videoVariantId)
    }
    const processingStages: ProcessingStages = {
      mux: notApplicableStage(),
      parentSync: completedStage(),
      downloads: notApplicableStage(),
      algoliaVideo: completedStage(),
      algoliaVariant: completedStage()
    }
    await store.videoVariantReconciliation.update({
      where: { id: reconciliationId },
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
    ['generated-parent', 'backfill-generated-parent'].includes(
      reconciliation.source
    )
  ) {
    return await reconcileGeneratedParent({
      reconciliationId,
      reconciliation,
      variant,
      store
    })
  }

  if (variant == null || reconciliation.published) return null

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
  await store.videoVariantReconciliation.update({
    where: { id: reconciliationId },
    data: {
      status: 'complete',
      processingStages,
      retryAt: null,
      errorMessage: null
    }
  })
  return { publicationReady: true, status: 'complete' }
}

async function reconcileGeneratedParent({
  reconciliationId,
  reconciliation,
  variant,
  store
}: {
  reconciliationId: string
  reconciliation: SourceReconciliation
  variant: SourceVariant
  store: ReconciliationStore
}): Promise<SourceSpecificReconciliationResult> {
  const stages: ProcessingStages = {
    mux: notApplicableStage(),
    parentSync: completedStage(
      previousAttempts(reconciliation.processingStages, 'parentSync') + 1
    ),
    downloads: notApplicableStage(),
    algoliaVideo: {
      state: 'pending',
      attempts: previousAttempts(
        reconciliation.processingStages,
        'algoliaVideo'
      )
    },
    algoliaVariant: {
      state: 'pending',
      attempts: previousAttempts(
        reconciliation.processingStages,
        'algoliaVariant'
      )
    }
  }

  try {
    await updateVideoInAlgolia(variant.videoId)
    stages.algoliaVideo = completedStage(stages.algoliaVideo.attempts + 1)
  } catch (error) {
    stages.algoliaVideo = failedStage(error, stages.algoliaVideo.attempts + 1)
    await persistReconciliationStatus({
      store,
      reconciliationId,
      status: 'degraded',
      stages,
      failedStageValue: stages.algoliaVideo
    })
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
    await persistReconciliationStatus({
      store,
      reconciliationId,
      status: 'degraded',
      stages,
      failedStageValue: stages.algoliaVariant
    })
    return { publicationReady: false, status: 'degraded' }
  }

  await persistReconciliationStatus({
    store,
    reconciliationId,
    status: 'complete',
    stages
  })
  return { publicationReady: true, status: 'complete' }
}
