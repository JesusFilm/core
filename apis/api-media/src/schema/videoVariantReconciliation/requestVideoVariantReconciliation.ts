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

export async function requestVideoVariantReconciliation(
  intent: ReconciliationIntent
): Promise<void> {
  const existingReconciliation =
    await prisma.videoVariantReconciliation.findUnique({
      where: { videoVariantId: intent.videoVariantId },
      select: { id: true }
    })
  const data = {
    reason: intent.reason,
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
