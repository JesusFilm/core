import { prisma } from '@core/prisma/media/client'

import { calculateAvailableLanguagesForVideos } from '../../../../schema/video/lib/updateAvailableLanguages'

const BATCH_SIZE = 100
const MAX_RETRIES = 3
// Well under Postgres's bind-parameter limit (and the lower threshold where
// Prisma's own IN-clause chunking is known to misfire), so a single read
// chunk can never itself exceed what one query can bind.
const READ_CHUNK_SIZE = 5000

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
// collection/series/featureFilm this job touches. Reads are batched, so the
// query count stays flat as the catalog grows.
export async function seedVideoLanguages(): Promise<void> {
  const videos = await prisma.video.findMany({ select: { id: true } })
  const videoIds = videos.map(({ id }) => id)

  // Batched on purpose: this job runs over the entire Video table, so a
  // per-video recompute would issue one query per row and get slower every
  // time the catalog grows. Chunked on purpose too: a single `id: { in }`
  // filter over the whole table can exceed the database's bind-parameter
  // limit once the catalog is large enough.
  const availableLanguagesByVideoId = new Map<string, string[]>()
  for (let i = 0; i < videoIds.length; i += READ_CHUNK_SIZE) {
    const chunk = videoIds.slice(i, i + READ_CHUNK_SIZE)
    const chunkResult = await calculateAvailableLanguagesForVideos(chunk)
    for (const [id, availableLanguages] of chunkResult) {
      availableLanguagesByVideoId.set(id, availableLanguages)
    }
  }

  // Built from the map, not from videoIds: a video deleted between the id
  // scan and this recompute has no map entry, and updating a since-deleted
  // row would fail the whole batch's transaction (and every retry of it).
  // Skipping it here means the rest of the batch still gets updated.
  const updates = Array.from(
    availableLanguagesByVideoId,
    ([id, availableLanguages]) => ({ id, availableLanguages })
  )

  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE)
    try {
      await updateBatch(batch)
    } catch (error) {
      console.error(`Failed to process batch ${i / BATCH_SIZE + 1}:`, error)
    }
  }
}
