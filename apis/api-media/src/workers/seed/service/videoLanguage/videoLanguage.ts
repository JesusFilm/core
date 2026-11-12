import { prisma } from '@core/prisma/media/client'

import { calculateAvailableLanguagesForVideos } from '../../../../schema/video/lib/updateAvailableLanguages'

const BATCH_SIZE = 100
const MAX_RETRIES = 3
// Well under Postgres's bind-parameter limit (and the lower threshold where
// Prisma's own IN-clause chunking is known to misfire), so a single read
// chunk can never itself exceed what one query can bind.
const READ_CHUNK_SIZE = 5000
// A generous bound on container-nesting depth (e.g. collection > series >
// episode). Each pass reads every child's *currently stored*
// availableLanguages, so it can only pick up a level's correction once the
// level below has already been written by an earlier pass - an N-level
// hierarchy needs N passes to fully converge. Capped, rather than looping
// until no change at all, so a cyclic or unexpectedly deep hierarchy in bad
// data can't loop forever; logs a warning if it's ever actually hit.
const MAX_PASSES = 10

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

// Batched on purpose: this job runs over the entire Video table, so a
// per-video recompute would issue one query per row and get slower every
// time the catalog grows. Chunked on purpose too: a single `id: { in }`
// filter over the whole table can exceed the database's bind-parameter
// limit once the catalog is large enough.
async function computeAvailableLanguagesByVideoId(
  videoIds: string[]
): Promise<Map<string, string[]>> {
  const availableLanguagesByVideoId = new Map<string, string[]>()
  for (let i = 0; i < videoIds.length; i += READ_CHUNK_SIZE) {
    const chunk = videoIds.slice(i, i + READ_CHUNK_SIZE)
    const chunkResult = await calculateAvailableLanguagesForVideos(chunk)
    for (const [id, availableLanguages] of chunkResult) {
      availableLanguagesByVideoId.set(id, availableLanguages)
    }
  }
  return availableLanguagesByVideoId
}

function languagesEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((lang, index) => lang === b[index])
}

// Entries of currentPass whose value differs from previousPass - i.e. what
// this pass still needs to write. A null previousPass (the first pass) has
// nothing to compare against, so everything counts as changed.
function diffPass(
  currentPass: Map<string, string[]>,
  previousPass: Map<string, string[]> | null
): Map<string, string[]> {
  if (previousPass == null) {
    return currentPass
  }
  return new Map(
    [...currentPass].filter(
      ([id, availableLanguages]) =>
        !languagesEqual(availableLanguages, previousPass.get(id) ?? [])
    )
  )
}

// Built from the map, not from videoIds: a video deleted between the id
// scan and this recompute has no map entry, and updating a since-deleted
// row would fail the whole batch's transaction (and every retry of it).
// Skipping it here means the rest of the batch still gets updated.
async function writeAvailableLanguages(
  availableLanguagesByVideoId: Map<string, string[]>
): Promise<void> {
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

// Reseeds every video's availableLanguages using the same canonical
// calculation every other write path uses (own published variants unioned
// with each live child's currently stored availableLanguages), rather than
// hand-deriving it from this video's own variants only - which would
// silently zero out every child-derived language on any
// collection/series/featureFilm this job touches.
//
// Run to a fixpoint rather than once: a container's children are read from
// their currently-stored value, so a multi-level hierarchy (collection >
// series > episode) only has its bottom level corrected on the first pass -
// the series above it still computed from the episode's pre-fix stale
// value. Looping until a pass computes the same result as the one before
// propagates each level's correction up to the next, and stops writing
// once nothing is left to fix (see MAX_PASSES above for the safety cap).
export async function seedVideoLanguages(): Promise<void> {
  const videos = await prisma.video.findMany({ select: { id: true } })
  const videoIds = videos.map(({ id }) => id)

  let previousPass: Map<string, string[]> | null = null
  let converged = false
  for (let pass = 0; pass < MAX_PASSES; pass++) {
    const currentPass = await computeAvailableLanguagesByVideoId(videoIds)

    // A video absent from currentPass (deleted since the id scan) has no
    // entry here either, and so is simply never written - matching
    // writeAvailableLanguages' own map-driven skip of vanished rows.
    const changed = diffPass(currentPass, previousPass)

    if (changed.size === 0) {
      converged = true
      break
    }

    await writeAvailableLanguages(changed)
    previousPass = currentPass
  }

  if (!converged) {
    console.error(
      `seedVideoLanguages: hit MAX_PASSES (${MAX_PASSES}) without converging`
    )
  }
}
