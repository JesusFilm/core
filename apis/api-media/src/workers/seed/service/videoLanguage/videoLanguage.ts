import { prisma } from '@core/prisma/media/client'

const BATCH_SIZE = 100
const MAX_RETRIES = 3

async function updateBatch(
  videos: { id: string; availableLanguages: string[] }[],
  retries = 0
): Promise<void> {
  try {
    await prisma.$transaction(
      videos.map(({ id, availableLanguages }) =>
        prisma.video.update({
          where: { id },
          data: { availableLanguages }
        })
      )
    )
  } catch (error) {
    if (retries < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return updateBatch(videos, retries + 1)
    }
    console.error('Failed to update batch after retries:', error)
    throw error
  }
}

export async function seedVideoLanguages(): Promise<void> {
  const videos = await prisma.video.findMany({
    select: {
      id: true,
      availableLanguages: true,
      variants: {
        select: {
          languageId: true
        }
      }
    }
  })

  const updates = videos.map((video) => ({
    id: video.id,
    availableLanguages: Array.from(
      new Set(video.variants.map((variant) => variant.languageId))
    )
  }))

  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE)
    try {
      await updateBatch(batch)
    } catch (error) {
      console.error(`Failed to process batch ${i / BATCH_SIZE + 1}:`, error)
    }
  }
}
