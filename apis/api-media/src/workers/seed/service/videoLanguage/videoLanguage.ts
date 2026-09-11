import { prisma } from '@core/prisma/media/client'

import { calculateAvailableLanguages } from '../../../../schema/video/lib/updateAvailableLanguages'

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

// Reseeds every video's availableLanguages using the same canonical
// calculation every other write path uses (own published variants unioned
// with each live child's currently stored availableLanguages), rather than
// hand-deriving it from this video's own variants only - which would
// silently zero out every child-derived language on any
// collection/series/featureFilm this job touches.
export async function seedVideoLanguages(): Promise<void> {
  const videos = await prisma.video.findMany({ select: { id: true } })

  const updates: Array<{ id: string; availableLanguages: string[] }> = []
  for (const { id } of videos) {
    updates.push({
      id,
      availableLanguages: await calculateAvailableLanguages(id)
    })
  }

  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE)
    try {
      await updateBatch(batch)
    } catch (error) {
      console.error(`Failed to process batch ${i / BATCH_SIZE + 1}:`, error)
    }
  }
}
