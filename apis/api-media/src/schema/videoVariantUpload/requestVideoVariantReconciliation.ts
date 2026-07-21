import { prisma } from '@core/prisma/media/client'

type ReconciliationIntent = {
  videoVariantId: string
  videoId: string
  languageId: string
  edition: string
  published: boolean
  source: string
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
  const canonicalStatus = await prisma.videoVariantUpload.findFirst({
    where: { videoVariantId: intent.videoVariantId, canonical: true },
    select: { id: true }
  })
  const data = {
    source: intent.source,
    status: 'processing' as const,
    videoId: intent.videoId,
    languageId: intent.languageId,
    edition: intent.edition,
    published: intent.published,
    processingStages: pendingStages,
    retryAt: new Date(),
    errorMessage: null
  }

  if (canonicalStatus != null) {
    await prisma.videoVariantUpload.update({
      where: { id: canonicalStatus.id },
      data
    })
    return
  }

  await prisma.videoVariantUpload.create({
    data: {
      ...data,
      canonical: true,
      videoVariantId: intent.videoVariantId
    }
  })
}
