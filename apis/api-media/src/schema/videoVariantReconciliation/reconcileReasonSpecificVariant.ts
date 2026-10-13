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
  persistReconciliationStatus,
  syncVideoRecordStage
} from './reconciliationStages'
import type { VideoVariantReconciliationReason } from './requestVideoVariantReconciliation'
import { videoVariantContainsMedia } from './videoVariantContainsMedia'

type ReconciledVariant = {
  id: string
  videoId: string
  languageId: string
  published: boolean
  muxVideo: { readyToStream: boolean } | null
  hls?: string | null
  share?: string | null
  video?: { label: string } | null
}

const CONTAINER_LABELS = new Set(['collection', 'series', 'featureFilm'])

// A generated parent Variant is recognisable by shape: it belongs to a
// container Video and has no media of its own. requestVideoVariantReconciliation
// overwrites `reason` on re-request (a publish toggle, a childIds edit on the
// grandparent), so relying on the reason alone sent these down the general
// path, where the Mux check can never pass.
export function isGeneratedParentVariant(variant: ReconciledVariant): boolean {
  if (variant.video == null || !CONTAINER_LABELS.has(variant.video.label)) {
    return false
  }
  return (
    variant.muxVideo == null &&
    !videoVariantContainsMedia({ hls: variant.hls, share: variant.share })
  )
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
    stageName: 'parentSync' | 'algoliaVideo' | 'algoliaVariant'
    stage: ProcessingStages['parentSync' | 'algoliaVideo' | 'algoliaVariant']
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

  // The generated-parent path always publishes, so a shape-detected parent is
  // only routed there when publication is the intent; an unpublish of a parent
  // Variant falls through to reconcileUnpublishVariant below.
  if (
    variant != null &&
    (['generated-parent', 'backfill-generated-parent'].includes(
      reconciliation.reason
    ) ||
      (reconciliation.published && isGeneratedParentVariant(variant)))
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
  } catch (error) {
    // generatedParentStages() seeds parentSync's attempts assuming success
    // (previousAttempts + 1), so the failure here reuses that count rather
    // than incrementing again.
    stages.parentSync = failedStage(error, stages.parentSync.attempts)
    await persistReconciliationStatus({
      store,
      reconciliationId,
      status: 'degraded',
      stages,
      failedStageValue: stages.parentSync
    })
    return {
      publicationReady: false,
      status: 'degraded',
      failure: {
        stageName: 'parentSync',
        stage: stages.parentSync
      }
    }
  }

  stages.algoliaVideo = await syncVideoRecordStage(
    reconciliation.videoId,
    stages.algoliaVideo
  )

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

  const videoRecordFailure = await persistVideoRecordFailure({
    store,
    reconciliationId,
    stages
  })
  if (videoRecordFailure != null) return videoRecordFailure

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
  } catch (error) {
    // generatedParentStages() seeds parentSync's attempts assuming success
    // (previousAttempts + 1), so the failure here reuses that count rather
    // than incrementing again.
    stages.parentSync = failedStage(error, stages.parentSync.attempts)
    await persistReconciliationStatus({
      store,
      reconciliationId,
      status: 'degraded',
      stages,
      failedStageValue: stages.parentSync
    })
    return {
      publicationReady: false,
      status: 'degraded',
      failure: {
        stageName: 'parentSync',
        stage: stages.parentSync
      }
    }
  }

  stages.algoliaVideo = await syncVideoRecordStage(
    variant.videoId,
    stages.algoliaVideo
  )

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

  const videoRecordFailure = await persistVideoRecordFailure({
    store,
    reconciliationId,
    stages
  })
  if (videoRecordFailure != null) return videoRecordFailure

  await persistReconciliationStatus({
    store,
    reconciliationId,
    status: 'complete',
    stages
  })
  return { publicationReady: true, status: 'complete' }
}

// The Variant's own record is written by now; a Video record that failed
// still leaves the reconciliation degraded so it is retried and alerted on.
async function persistVideoRecordFailure({
  store,
  reconciliationId,
  stages
}: {
  store: ReconciliationStore
  reconciliationId: string
  stages: ProcessingStages
}): Promise<ReasonSpecificReconciliationResult | null> {
  if (stages.algoliaVideo.state !== 'failed') return null

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
    failure: { stageName: 'algoliaVideo', stage: stages.algoliaVideo }
  }
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
