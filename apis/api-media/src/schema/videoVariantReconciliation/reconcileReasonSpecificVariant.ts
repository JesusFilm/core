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
  generatedParentStages,
  notApplicableStage,
  persistReconciliationStatus
} from './reconciliationStages'
import type { VideoVariantReconciliationReason } from './requestVideoVariantReconciliation'

type ReconciledVariant = {
  id: string
  videoId: string
  languageId: string
  published: boolean
  muxVideo: { readyToStream: boolean } | null
}

type ReasonSpecificReconciliation = {
  reason: VideoVariantReconciliationReason
  videoId: string
  languageId: string
  videoVariantId: string | null
  published: boolean
  processingStages: unknown
}

export type ReasonSpecificReconciliationResult = {
  publicationReady: boolean
  status: ReconciliationStatus
  failure?: {
    stageName: 'algoliaVideo' | 'algoliaVariant'
    stage: ProcessingStages['algoliaVideo' | 'algoliaVariant']
  }
}

export async function reconcileReasonSpecificVariant({
  reconciliationId,
  reconciliation,
  variant,
  store
}: {
  reconciliationId: string
  reconciliation: ReasonSpecificReconciliation
  variant: ReconciledVariant | null
  store: ReconciliationStore
}): Promise<ReasonSpecificReconciliationResult | null> {
  if (reconciliation.reason === 'video-variant-delete') {
    return await reconcileDeleteVariant({
      reconciliationId,
      reconciliation,
      store
    })
  }

  if (
    variant != null &&
    ['generated-parent', 'backfill-generated-parent'].includes(
      reconciliation.reason
    )
  ) {
    return await reconcileGeneratedParentVariant({
      reconciliationId,
      reconciliation,
      variant,
      store
    })
  }

  if (variant == null || reconciliation.published) return null

  return await reconcileUnpublishVariant({
    reconciliationId,
    reconciliation,
    variant,
    store
  })
}

async function reconcileDeleteVariant({
  reconciliationId,
  reconciliation,
  store
}: {
  reconciliationId: string
  reconciliation: ReasonSpecificReconciliation
  store: ReconciliationStore
}): Promise<ReasonSpecificReconciliationResult> {
  const stages = generatedParentStages(reconciliation.processingStages)

  try {
    await removeLanguageFromVideoIfUnused(
      reconciliation.videoId,
      reconciliation.languageId
    )
    await updateParentCollectionLanguages(reconciliation.videoId)
    await updateVideoInAlgolia(reconciliation.videoId)
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
    return {
      publicationReady: false,
      status: 'degraded',
      failure: {
        stageName: 'algoliaVideo',
        stage: stages.algoliaVideo
      }
    }
  }

  try {
    if (reconciliation.videoVariantId != null) {
      await updateVideoVariantInAlgolia(reconciliation.videoVariantId)
    }
    stages.algoliaVariant = completedStage(stages.algoliaVariant.attempts + 1)
  } catch (error) {
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
    return {
      publicationReady: false,
      status: 'degraded',
      failure: {
        stageName: 'algoliaVariant',
        stage: stages.algoliaVariant
      }
    }
  }

  await persistReconciliationStatus({
    store,
    reconciliationId,
    status: 'complete',
    stages
  })
  return { publicationReady: true, status: 'complete' }
}

async function reconcileUnpublishVariant({
  reconciliationId,
  reconciliation,
  variant,
  store
}: {
  reconciliationId: string
  reconciliation: ReasonSpecificReconciliation
  variant: ReconciledVariant
  store: ReconciliationStore
}): Promise<ReasonSpecificReconciliationResult> {
  const stages = generatedParentStages(reconciliation.processingStages)
  stages.mux =
    variant.muxVideo?.readyToStream === true
      ? completedStage()
      : notApplicableStage()

  try {
    await prisma.videoVariant.update({
      where: { id: variant.id },
      data: { published: false }
    })
    await removeLanguageFromVideoIfUnused(variant.videoId, variant.languageId)
    await updateParentCollectionLanguages(variant.videoId)
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
    return {
      publicationReady: false,
      status: 'degraded',
      failure: {
        stageName: 'algoliaVideo',
        stage: stages.algoliaVideo
      }
    }
  }

  try {
    await updateVideoVariantInAlgolia(variant.id)
    stages.algoliaVariant = completedStage(stages.algoliaVariant.attempts + 1)
  } catch (error) {
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
    return {
      publicationReady: false,
      status: 'degraded',
      failure: {
        stageName: 'algoliaVariant',
        stage: stages.algoliaVariant
      }
    }
  }

  await persistReconciliationStatus({
    store,
    reconciliationId,
    status: 'complete',
    stages
  })
  return { publicationReady: true, status: 'complete' }
}

export async function reconcileGeneratedParentVariant({
  reconciliationId,
  reconciliation,
  variant,
  store
}: {
  reconciliationId: string
  reconciliation: ReasonSpecificReconciliation
  variant: ReconciledVariant
  store: ReconciliationStore
}): Promise<ReasonSpecificReconciliationResult> {
  const stages = generatedParentStages(reconciliation.processingStages)

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
    return {
      publicationReady: false,
      status: 'degraded',
      failure: {
        stageName: 'algoliaVideo',
        stage: stages.algoliaVideo
      }
    }
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
      try {
        await prisma.videoVariant.update({
          where: { id: variant.id },
          data: { published: false }
        })
      } catch {
        // fall through; the persisted degraded status below records the failure
      }
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
    return {
      publicationReady: false,
      status: 'degraded',
      failure: {
        stageName: 'algoliaVariant',
        stage: stages.algoliaVariant
      }
    }
  }

  await persistReconciliationStatus({
    store,
    reconciliationId,
    status: 'complete',
    stages
  })
  return { publicationReady: true, status: 'complete' }
}
