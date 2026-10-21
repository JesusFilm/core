import { prisma } from '@core/prisma/media/client'

export type VideoVariantReconciliationReason =
  | 'process-video-upload'
  | 'video-relationship-change'
  | 'video-variant-create'
  | 'video-variant-delete'
  | 'video-variant-language-change'
  | 'video-variant-publication-change'
  | 'fresh-upload-publication-change'
  | 'generated-parent'
  | 'backfill-generated-parent'

// A fresh upload's Variant is shape-identical to a generated parent (no
// muxVideo, no hls/share) until Mux settles its media state -- see
// isGeneratedParentVariant in reconcileReasonSpecificVariant.ts, which
// excludes these reasons from the shape heuristic. That exclusion only
// holds if a re-request (a publish toggle, a language edit) made before
// Mux resolves doesn't overwrite the reason out from under it, which is
// what the stickiness below prevents.
//
// `fresh-upload-publication-change` is an explicit publish/Draft toggle made
// on such a Variant. It has to carry both facts at once: that the Variant is
// still a fresh upload (so it stays out of the shape heuristic) and that an
// explicit toggle is pending (so a stale upload callback can't clobber it --
// see EXPLICIT_PUBLICATION_REASONS).
export const FRESH_UPLOAD_REASONS = new Set<VideoVariantReconciliationReason>([
  'video-variant-create',
  'process-video-upload',
  'fresh-upload-publication-change'
])

// Reasons that record an editor's explicit publish/Draft request. While one
// of these is still pending (status 'processing' or 'degraded'), its
// `published` value is fresher than anything a captured upload intent or a
// non-toggle re-request could carry.
const EXPLICIT_PUBLICATION_REASONS: VideoVariantReconciliationReason[] = [
  'video-variant-publication-change',
  'fresh-upload-publication-change'
]

const pendingExplicitPublication = {
  reason: { in: EXPLICIT_PUBLICATION_REASONS },
  status: { in: ['processing' as const, 'degraded' as const] }
}

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
  // A timed-out upload ('failed') is still "not resolved" for stickiness
  // purposes: it never produced media, so it must keep being treated as a
  // genuinely failed upload rather than falling through to the shape
  // heuristic that would misclassify it as a media-less generated parent.
  // Only 'complete' (media produced) or 'notApplicable' (reconciled via a
  // different path, e.g. unpublish) count as resolved.
  return state !== 'complete' && state !== 'notApplicable'
}

export async function requestVideoVariantReconciliation(
  intent: ReconciliationIntent
): Promise<void> {
  const existingReconciliation =
    await prisma.videoVariantReconciliation.findUnique({
      where: { videoVariantId: intent.videoVariantId },
      select: { id: true, reason: true, processingStages: true }
    })

  // Keep a fresh upload's original reason until Mux actually produces media
  // (or the Variant is reconciled via a different path), so a re-request in
  // between -- including after a timeout, which still leaves no media --
  // can't make a media-less Variant look like a generated parent. An
  // explicit toggle in that window is recorded as
  // fresh-upload-publication-change, which is itself a fresh-upload reason. A
  // delete is never inherited over: the Variant is gone, and only the delete
  // reason runs the cleanup in reconcileReasonSpecificVariant.
  const freshUploadPending =
    intent.reason !== 'video-variant-delete' &&
    existingReconciliation != null &&
    FRESH_UPLOAD_REASONS.has(
      existingReconciliation.reason as VideoVariantReconciliationReason
    ) &&
    isMuxUnresolved(existingReconciliation.processingStages)
  const reason: VideoVariantReconciliationReason = !freshUploadPending
    ? intent.reason
    : intent.reason === 'video-variant-publication-change'
      ? 'fresh-upload-publication-change'
      : (existingReconciliation.reason as VideoVariantReconciliationReason)

  // `published` is deliberately not in here: whether this call may set it
  // depends on the reason and on the row's live state (see below).
  const stateWithoutReason = {
    status: 'processing' as const,
    videoId: intent.videoId,
    languageId: intent.languageId,
    edition: intent.edition,
    processingStages: pendingStages,
    retryAt: new Date(),
    errorMessage: null
  }
  const data = { ...stateWithoutReason, reason }

  if (existingReconciliation != null) {
    // A re-request is a fresh intent. createdAt is what the reconciler's
    // time windows (the two-hour Mux wait, the 24-hour Downloads retry) count
    // from, so leaving the original value would let a record that has sat
    // around for days fail its "two hours" on the very first sweep.
    const createdAt = new Date()

    // A process-video-upload callback captures its publish intent before Mux
    // finishes, so it can race an editor's explicit publish/Draft request
    // issued while Mux is still processing. The explicit request is always
    // fresher than a captured upload intent, so a blind update would let the
    // stale intent win in either direction; this conditional update instead
    // leaves an existing explicit request untouched, regardless of which way
    // the stale upload intent or the explicit request point. The guard is
    // scoped to a toggle that is still pending (status still 'processing' or
    // 'degraded') rather than to the reason value alone -- that value is
    // never cleared once set, so a later re-upload for the same variant would
    // otherwise find this guard permanently blocking it, even long after the
    // toggle it was protecting has settled.
    if (intent.reason === 'process-video-upload') {
      await prisma.videoVariantReconciliation.updateMany({
        where: {
          id: existingReconciliation.id,
          NOT: pendingExplicitPublication
        },
        data: { ...data, published: intent.published, createdAt }
      })
      return
    }

    // Only an explicit publish/Draft toggle carries a fresh publish intent.
    // Every other reason -- a language reassignment, a relationship change,
    // a re-create -- can land while a captured upload intent or an explicit
    // toggle is still pending on this row, and the caller computes its
    // `published` from the Variant's current column, which has not caught
    // up to that pending intent yet. Leaving `published` out of the update
    // keeps the pending intent intact instead of discarding it.
    if (intent.reason !== 'video-variant-publication-change') {
      // A pending explicit toggle (still processing/degraded) protects
      // `published` from the process-video-upload guard above by its
      // `reason`. Overwriting that reason here -- even though this update
      // already leaves `published` untouched -- would remove that
      // protection and let a later stale upload callback win, so a row with
      // a pending toggle keeps whichever explicit reason it already has.
      // Deciding this from `existingReconciliation`, read at the top of this
      // call, would reopen the same read-then-write race the
      // process-video-upload guard above closes with a conditional
      // `updateMany` -- so gate each write on the row's live state instead
      // of that stale read.
      await prisma.videoVariantReconciliation.updateMany({
        where: {
          id: existingReconciliation.id,
          ...pendingExplicitPublication
        },
        data: { ...stateWithoutReason, createdAt }
      })
      await prisma.videoVariantReconciliation.updateMany({
        where: {
          id: existingReconciliation.id,
          NOT: pendingExplicitPublication
        },
        data: { ...data, createdAt }
      })
      return
    }

    await prisma.videoVariantReconciliation.update({
      where: { id: existingReconciliation.id },
      data: { ...data, published: intent.published, createdAt }
    })
    return
  }

  await prisma.videoVariantReconciliation.create({
    data: {
      ...data,
      published: intent.published,
      videoVariantId: intent.videoVariantId
    }
  })
}
