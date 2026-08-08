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
    await prisma.videoVariantReconciliation.update({
      where: { id: existingReconciliation.id },
      data
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
