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

// Calculates what availableLanguages should be for a given video
// Does NOT update the database - only calculates the correct value
//
// This is the single, canonical definition of availableLanguages: a video's
// own published variant languages, unioned with the *current* availableLanguages
// of its live (published) children. It always recomputes from source data
// rather than mutating a previous value, so removal is symmetric with
// addition for free - there is no separate "did we forget to remove"
// bookkeeping anywhere in this module.
export async function calculateAvailableLanguages(
  videoId: string
): Promise<string[]> {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: {
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
    return []
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

  return Array.from(languageSet).sort((a, b) => Number(a) - Number(b))
}

// True when two availableLanguages values represent the same set,
// irrespective of order - used to decide whether a recompute actually
// changed anything and therefore whether a cascade needs to keep walking.
// Exported for reuse by the batch verifier, which needs the same
// stored-vs-computed comparison.
export function sameLanguageSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const setA = new Set(a)
  return b.every((languageId) => setA.has(languageId))
}

async function getStoredAvailableLanguages(
  videoId: string
): Promise<string[] | null> {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { availableLanguages: true }
  })
  return video?.availableLanguages ?? null
}

// Updates a video's availableLanguages field based on current state
// Handles both regular videos and collections
export async function updateVideoAvailableLanguages(
  videoId: string,
  options: {
    skipCache?: boolean
    skipAlgolia?: boolean
  } = {}
): Promise<string[]> {
  const availableLanguages = await calculateAvailableLanguages(videoId)

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

  return availableLanguages
}

// Adds a language to a video's availableLanguages if not already present.
//
// Concurrent published uploads for the same video (different languages
// finishing around the same time) must not lose each other's language. A
// read-then-set (`findUnique` -> `set: [...current, next]`) is a classic
// lost-update race: both transactions read the same array and the second
// write clobbers the first. Instead, do the read-modify-write as a single
// atomic UPDATE so Postgres serializes concurrent callers on the row. This
// is kept as the primitive for a video's own value on this hot concurrent
// path deliberately - a plain "recompute from source data" read-then-write
// (as used everywhere else in this module) does not have the same
// serialization guarantee, since two independent SELECT/UPDATE pairs can
// still interleave and lose an update the same way.
export async function addLanguageToVideo(
  videoId: string,
  languageId: string
): Promise<void> {
  await prisma.$executeRaw`
    UPDATE "Video"
    SET "availableLanguages" = array_append("availableLanguages", ${languageId})
    WHERE id = ${videoId}
      AND NOT (${languageId} = ANY("availableLanguages"))
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

// Updates all parent videos (collections) when a child video's languages
// change, and keeps walking upward until it reaches videos with no further
// container parents - a three-or-more-level-deep hierarchy (e.g.
// featureFilm -> series -> video) gets every level updated, not just the
// immediate parent.
//
// `visitedPath` tracks the video ids already visited on the *current*
// traversal branch (not a global visited set - a diamond, where two
// siblings share a common grandparent, is legitimate and both branches
// should still update it). If a parent is already on the current path, the
// children/parents relation has a cycle; that branch is logged and
// abandoned instead of recursing forever.
export async function updateParentCollectionLanguages(
  childVideoId: string,
  visitedPath: ReadonlySet<string> = new Set()
): Promise<void> {
  if (visitedPath.has(childVideoId)) {
    logger.error(
      { videoId: childVideoId, path: Array.from(visitedPath) },
      'Cycle detected in video children/parents relation while cascading availableLanguages - aborting this branch'
    )
    return
  }

  const path = new Set(visitedPath)
  path.add(childVideoId)

  const parentIds = await findContainerParentIds(childVideoId)

  for (const parentId of parentIds) {
    const before = await getStoredAvailableLanguages(parentId)

    const languages = await updateVideoAvailableLanguages(parentId, {
      skipCache: false,
      skipAlgolia: false
    })

    // Stop walking this branch once a parent's recomputed value didn't
    // change - none of its own ancestors can be affected either. Keep
    // walking past any parent whose value did change.
    const changed = before == null || !sameLanguageSet(before, languages)
    if (changed) {
      await updateParentCollectionLanguages(parentId, path)
    }
  }
}

// Recomputes a single video's own availableLanguages from current source
// data and, if that changed anything, cascades the update all the way to
// the root of its container hierarchy. This is the one entry point every
// mutation, worker, and script should use when a video's own children,
// variants, or published state changes in a way that can affect its
// derived language set.
export async function recalculateAvailableLanguagesCascade(
  videoId: string,
  options: {
    skipCache?: boolean
    skipAlgolia?: boolean
  } = {}
): Promise<string[]> {
  const before = await getStoredAvailableLanguages(videoId)

  const languages = await updateVideoAvailableLanguages(videoId, options)

  const changed = before == null || !sameLanguageSet(before, languages)
  if (changed) {
    await updateParentCollectionLanguages(videoId)
  }

  return languages
}
