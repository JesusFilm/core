import { videoVariantContainsMedia } from '../../schema/videoVariantReconciliation/videoVariantContainsMedia'

import type {
  ParentVideoForClassification,
  ProcessingStage,
  ProcessingStages,
  VideoForClassification,
  VideoVariantClassification,
  VideoVariantForClassification,
  VideoVariantProcessingStatus
} from './types'

function completeStage(): ProcessingStage {
  const at = new Date().toISOString()
  return {
    state: 'complete',
    attempts: 1,
    lastAttemptAt: at,
    lastSuccessAt: at
  }
}

function failedStage(error: string): ProcessingStage {
  return {
    state: 'failed',
    attempts: 1,
    error,
    lastAttemptAt: new Date().toISOString()
  }
}

// Marks a stage the backfill has no DB signal to verify one way or the other.
// Never used to imply success -- see the module doc comment below.
function unknownStage(): ProcessingStage {
  return { state: 'unknown', attempts: 0 }
}

function notApplicableStage(): ProcessingStage {
  return { state: 'notApplicable', attempts: 0 }
}

/**
 * A generated parent Variant is a placeholder created purely to propagate a
 * language up to a container Video -- it never carries real media. There is
 * no stored flag for this; it is inferred exactly like the #9468 audit tool
 * infers it: a Variant on a Video with children, containing none of the
 * media indicators videoVariantContainsMedia checks.
 */
export function isGeneratedParentVariant(
  variant: VideoVariantForClassification,
  video: VideoForClassification
): boolean {
  return video.childIds.length > 0 && !videoVariantContainsMedia(variant)
}

function classifyMuxStage(
  variant: VideoVariantForClassification,
  isGeneratedParent: boolean,
  hasUsableMedia: boolean
): ProcessingStage {
  if (isGeneratedParent) return notApplicableStage()

  if (variant.muxVideoId != null) {
    return variant.muxVideoReadyToStream === true
      ? completeStage()
      : unknownStage()
  }

  if (!hasUsableMedia) {
    return failedStage('Variant has no Mux video and no other usable media')
  }

  // Sourced from something other than Mux (assetId, brightcoveId, a direct
  // hls/share URL) -- Mux was never part of this Variant's pipeline.
  return notApplicableStage()
}

function classifyDownloadsStage(
  variant: VideoVariantForClassification,
  isGeneratedParent: boolean
): ProcessingStage {
  if (isGeneratedParent) return notApplicableStage()
  if (!variant.downloadable) return notApplicableStage()

  return variant.downloads.length > 0
    ? completeStage()
    : failedStage('Requested Downloads are not ready')
}

function classifyParentSyncStage(
  variant: VideoVariantForClassification,
  video: VideoForClassification,
  isGeneratedParent: boolean,
  parentVideos: ParentVideoForClassification[]
): ProcessingStage {
  if (isGeneratedParent) {
    // `video` IS the parent for a generated parent Variant; the language it
    // was generated for should already be listed on it.
    return video.availableLanguages.includes(variant.languageId)
      ? completeStage()
      : failedStage(
          `Parent Video ${video.id} does not list language ${variant.languageId} in availableLanguages`
        )
  }

  if (parentVideos.length === 0) return notApplicableStage()

  const unsynced = parentVideos.filter(
    (parent) => !parent.availableLanguages.includes(variant.languageId)
  )
  return unsynced.length === 0
    ? completeStage()
    : failedStage(
        `Parent Video(s) ${unsynced.map((p) => p.id).join(', ')} do not list language ${variant.languageId} in availableLanguages`
      )
}

/**
 * Algolia indexing has no observable signal anywhere in the media database --
 * confirmed absent from the Prisma schema. A backfill script that only reads
 * Postgres can never verify it, and the acceptance criteria for this backfill
 * require that unverifiable stages are recorded `unknown`, never manufactured
 * as success. The live reconciliation worker (VideoVariantReconciliation)
 * calls Algolia directly to get a real answer; this backfill deliberately
 * does not, to stay a pure, safe, replayable database read.
 */
function algoliaStage(): ProcessingStage {
  return unknownStage()
}

export function classifyVideoVariant(
  variant: VideoVariantForClassification,
  video: VideoForClassification,
  parentVideos: ParentVideoForClassification[]
): VideoVariantClassification {
  const isGeneratedParent = isGeneratedParentVariant(variant, video)
  const hasUsableMedia = isGeneratedParent || videoVariantContainsMedia(variant)

  const stages: ProcessingStages = {
    mux: classifyMuxStage(variant, isGeneratedParent, hasUsableMedia),
    parentSync: classifyParentSyncStage(
      variant,
      video,
      isGeneratedParent,
      parentVideos
    ),
    downloads: classifyDownloadsStage(variant, isGeneratedParent),
    algoliaVideo: algoliaStage(),
    algoliaVariant: algoliaStage()
  }

  const processingStatus = computeProcessingStatus(stages, hasUsableMedia)

  return {
    isGeneratedParentVariant: isGeneratedParent,
    hasUsableMedia,
    stages,
    processingStatus
  }
}

function computeProcessingStatus(
  stages: ProcessingStages,
  hasUsableMedia: boolean
): VideoVariantProcessingStatus {
  if (!hasUsableMedia) return 'failed'

  const applicableStages = Object.values(stages).filter(
    (stage) => stage.state !== 'notApplicable'
  )
  const allComplete = applicableStages.every(
    (stage) => stage.state === 'complete'
  )
  return allComplete ? 'complete' : 'degraded'
}
