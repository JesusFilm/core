// Shared logic for calculating and updating video availableLanguages
// Single source of truth for managing availableLanguages on videos
// Handles both regular videos and collections
// Used by video.ts and videoVariant.ts

import { prisma } from '@core/prisma/media/client'

import { videoCacheReset } from '../../../lib/videoCacheReset'
import {
  enqueueVideoAlgoliaSync,
  videoOnlyScope
} from '../../../workers/videoAlgoliaSync'
import { logger } from '../../logger'

// Calculates what availableLanguages should be for a given video, and
// returns it alongside the value currently stored on the row. Both come off
// a single `findUnique` - the caller (e.g. the cascade walker) needs the
// stored ("previous") value too, and adding it to this same select avoids a
// second dedicated read of the same row immediately before/after this one.
// Does NOT update the database - only calculates the correct value.
export async function calculateAvailableLanguages(videoId: string): Promise<{
  languages: string[]
  previousLanguages: string[]
}> {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: {
      label: true,
      availableLanguages: true,
      variants: {
        where: { published: true },
        select: { languageId: true }
      },
      children: {
        where: { published: true },
        select: { availableLanguages: true }
      }
    }
  })

  if (video == null) {
    return { languages: [], previousLanguages: [] }
  }

  const languageSet = new Set<string>()
  // Always include published variants on the video itself
  for (const variant of video.variants) {
    languageSet.add(variant.languageId)
  }

  // If there are children, include their availableLanguages
  if (video.children.length > 0) {
    for (const child of video.children) {
      for (const lang of child.availableLanguages) {
        languageSet.add(lang)
      }
    }
  }

  return {
    languages: Array.from(languageSet).sort((a, b) => Number(a) - Number(b)),
    previousLanguages: video.availableLanguages
  }
}

// Updates a video's availableLanguages field based on current state
// Handles both regular videos and collections
export async function updateVideoAvailableLanguages(
  videoId: string,
  options: {
    skipCache?: boolean
    skipAlgolia?: boolean
  } = {}
): Promise<{ before: string[]; after: string[] }> {
  const { languages: availableLanguages, previousLanguages } =
    await calculateAvailableLanguages(videoId)

  // Update the video
  await prisma.video.update({
    where: { id: videoId },
    data: {
      availableLanguages: {
        set: availableLanguages
      }
    }
  })

  // Update cache and search index unless skipped
  if (!options.skipAlgolia) {
    await enqueueVideoAlgoliaSync(videoId, videoOnlyScope, logger)
  }

  if (!options.skipCache) {
    try {
      await videoCacheReset(videoId)
    } catch (error) {
      console.error('Cache reset error:', error)
    }
  }

  return { before: previousLanguages, after: availableLanguages }
}

// Adds a language to a video's availableLanguages if not already present.
//
// Concurrent published uploads for the same video (different languages
// finishing around the same time) must not lose each other's language. A
// read-then-set (`findUnique` -> `set: [...current, next]`) is a classic
// lost-update race: both transactions read the same array and the second
// write clobbers the first. Instead, do the read-modify-write as a single
// atomic UPDATE so Postgres serializes concurrent callers on the row.
// COALESCE handles the nullable column so array_append always has a base array.
//
// This is kept as a hot-path primitive for a video's *own* value
// deliberately, rather than retired in favor of `calculateAvailableLanguages`
// everywhere: a plain recompute (read current variants, write the union) does
// not have the same serialization guarantee as this single atomic statement -
// two independent read/write pairs can still interleave and clobber each
// other's write. The "always fully recompute, never incrementally mutate"
// principle is applied at the cascade level instead (see
// `updateParentCollectionLanguages` below), which isn't on this hot
// concurrent-write path.
export async function addLanguageToVideo(
  videoId: string,
  languageId: string
): Promise<void> {
  await prisma.$executeRaw`
    UPDATE "Video"
    SET "availableLanguages" = array_append(COALESCE("availableLanguages", ARRAY[]::TEXT[]), ${languageId})
    WHERE id = ${videoId}
      AND NOT (${languageId} = ANY(COALESCE("availableLanguages", ARRAY[]::TEXT[])))
  `
}

// Removes a language from a video's availableLanguages if no published variants use it
// Uses transaction to ensure consistency
export async function removeLanguageFromVideoIfUnused(
  videoId: string,
  languageId: string
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const video = await tx.video.findUnique({
      where: { id: videoId },
      select: { availableLanguages: true }
    })

    if (video == null) return

    // Check if there are any other published variants with this language
    const hasOtherVariants = await tx.videoVariant.count({
      where: { videoId, languageId, published: true }
    })

    // Only remove if no published variants use this language
    if (hasOtherVariants === 0) {
      await tx.video.update({
        where: { id: videoId },
        data: {
          availableLanguages: {
            set: video.availableLanguages.filter(
              (lang: string) => lang !== languageId
            )
          }
        }
      })
    }
  })
}

// Finds the container videos (collections/series/featureFilms) that list
// the given video as a child. Shared by language-cascade and Algolia
// parent-cascade callers.
export async function findContainerParentIds(
  childVideoId: string
): Promise<string[]> {
  const parents = await prisma.video.findMany({
    where: {
      children: {
        some: { id: childVideoId }
      },
      label: {
        in: ['collection', 'series', 'featureFilm']
      }
    },
    select: { id: true }
  })

  return parents.map((parent) => parent.id)
}

// True when two availableLanguages values represent the same set of
// languages, irrespective of order or duplicates. Used to decide whether a
// recompute actually changed a video's stored value, and therefore whether
// the cascade needs to keep walking upward past it.
export function sameLanguageSet(a: string[], b: string[]): boolean {
  const setA = new Set(a)
  const setB = new Set(b)
  if (setA.size !== setB.size) return false
  return [...setA].every((languageId) => setB.has(languageId))
}

// Updates all parent videos (collections) when a child video's languages
// change, cascading all the way to the root of the container hierarchy - a
// three-or-more-level-deep hierarchy (e.g. featureFilm -> series -> video)
// gets every level updated, not just the immediate parent.
//
// Each parent's value is always fully recomputed from its own current
// source data (own published variants union its live children's current
// values) rather than incrementally mutated, so a level whose recomputed
// value doesn't change stops the cascade from walking past it - there is
// nothing further up that could be affected.
//
// `visitedPath` tracks the video ids already on the current traversal
// branch, starting with the video whose change triggered this call. If a
// parent is already on that path, the children/parents relation has a
// cycle; that branch is logged and abandoned instead of recursing forever.
// (A diamond - two branches sharing a common ancestor - is not a cycle and
// is not affected: each branch carries its own path.)
export async function updateParentCollectionLanguages(
  childVideoId: string
): Promise<void> {
  await cascadeParentCollectionLanguages(childVideoId, new Set([childVideoId]))
}

async function cascadeParentCollectionLanguages(
  childVideoId: string,
  visitedPath: ReadonlySet<string>
): Promise<void> {
  const parentIds = await findContainerParentIds(childVideoId)

  for (const parentId of parentIds) {
    if (visitedPath.has(parentId)) {
      logger.error(
        { videoId: parentId, path: Array.from(visitedPath) },
        'Cycle detected in video children/parents relation while cascading availableLanguages - stopping this branch'
      )
      continue
    }

    try {
      const { before, after } = await updateVideoAvailableLanguages(parentId, {
        skipCache: false,
        skipAlgolia: false
      })

      if (!sameLanguageSet(before, after)) {
        await cascadeParentCollectionLanguages(
          parentId,
          new Set([...visitedPath, parentId])
        )
      }
    } catch (error) {
      logger.error(
        { videoId: parentId, path: Array.from(visitedPath), error },
        'Failed to cascade availableLanguages to parent while walking video children/parents relation - abandoning this branch'
      )
      continue
    }
  }
}
