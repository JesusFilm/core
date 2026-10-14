import { prisma } from '@core/prisma/media/client'

export type VideoVariantReconciliationReason =
  | 'process-video-upload'
  | 'video-relationship-change'
  | 'video-variant-create'
  | 'video-variant-delete'
  | 'video-variant-language-change'
  | 'video-variant-publication-change'
  | 'generated-parent'
  | 'backfill-generated-parent'

// A fresh upload's Variant is shape-identical to a generated parent (no
// muxVideo, no hls/share) until Mux settles its media state -- see
// isGeneratedParentVariant in reconcileReasonSpecificVariant.ts, which
// excludes these reasons from the shape heuristic. That exclusion only
// holds if a re-request (a publish toggle, a language edit) made before
// Mux resolves doesn't overwrite the reason out from under it, which is
// what the stickiness below prevents.
export const FRESH_UPLOAD_REASONS = new Set<VideoVariantReconciliationReason>([
  'video-variant-create',
  'process-video-upload'
])

type ReconciliationIntent = {
  videoVariantId: string
  videoId: string
  languageId: string
  edition: string
  published: boolean
  reason: VideoVariantReconciliationReason
}

const pendingStages = {
  mux: { state: 'pending', attempts: 0 },
  parentSync: { state: 'pending', attempts: 0 },
  downloads: { state: 'pending', attempts: 0 },
  algoliaVideo: { state: 'pending', attempts: 0 },
  algoliaVariant: { state: 'pending', attempts: 0 }
}

function isMuxUnresolved(processingStages: unknown): boolean {
  if (processingStages == null || typeof processingStages !== 'object') {
    return true
  }
  const mux = (processingStages as Record<string, unknown>).mux
  if (mux == null || typeof mux !== 'object') return true
  const state = (mux as Record<string, unknown>).state
  return state === 'pending' || state === 'processing'
}

export async function requestVideoVariantReconciliation(
  intent: ReconciliationIntent
): Promise<void> {
  const existingReconciliation =
    await prisma.videoVariantReconciliation.findUnique({
      where: { videoVariantId: intent.videoVariantId },
      select: { id: true, reason: true, processingStages: true }
    })

  // Keep a fresh upload's original reason until Mux resolves one way or
  // the other, so a re-request in between (a publish toggle, a language
  // edit) can't make a media-less Variant look like a generated parent.
  const reason =
    existingReconciliation != null &&
    FRESH_UPLOAD_REASONS.has(
      existingReconciliation.reason as VideoVariantReconciliationReason
    ) &&
    isMuxUnresolved(existingReconciliation.processingStages)
      ? (existingReconciliation.reason as VideoVariantReconciliationReason)
      : intent.reason

  const data = {
    reason,
    status: 'processing' as const,
    videoId: intent.videoId,
    languageId: intent.languageId,
    edition: intent.edition,
    published: intent.published,
    processingStages: pendingStages,
    retryAt: new Date(),
    errorMessage: null
  }

  if (existingReconciliation != null) {
    // A re-request is a fresh intent. createdAt is what the reconciler's
    // time windows (the two-hour Mux wait, the 24-hour Downloads retry) count
    // from, so leaving the original value would let a record that has sat
    // around for days fail its "two hours" on the very first sweep.
    await prisma.videoVariantReconciliation.update({
      where: { id: existingReconciliation.id },
      data: { ...data, createdAt: new Date() }
    })
    return
  }

  await prisma.videoVariantReconciliation.create({
    data: {
      ...data,
      videoVariantId: intent.videoVariantId
    }
  })
}
