// Shared logic for calculating and updating video availableLanguages
// Single source of truth for managing availableLanguages on videos
// Handles both regular videos and collections
// Used by video.ts and videoVariant.ts

import { Prisma, prisma } from '@core/prisma/media/client'

import { videoCacheReset } from '../../../lib/videoCacheReset'
import {
  enqueueVideoAlgoliaSync,
  videoOnlyScope
} from '../../../workers/videoAlgoliaSync'
import { logger } from '../../logger'

// Calculates what availableLanguages should be for a given video
// Does NOT update the database - only calculates the correct value
// Reads through `client` so it can run inside a caller's transaction.
export async function calculateAvailableLanguages(
  videoId: string,
  client: Prisma.TransactionClient = prisma
): Promise<string[]> {
  const video = await client.video.findUnique({
    where: { id: videoId },
    select: {
      label: true,
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

interface AvailableLanguagesSyncOptions {
  skipCache?: boolean
  skipAlgolia?: boolean
}

// Takes the video's exclusive row lock for the rest of `tx`.
//
// This is what serializes concurrent recomputes of the same video. The
// read-then-set below is the same lost-update race that `addLanguageToVideo`
// warns about: two concurrent variant writes against the *same* parent can
// each read the pre-write state, and the second write clobbers the first.
// Unlike a video's own language add, the recomputed value is a union over
// other rows (the video's published variants and its published children's
// stored values), so it cannot be collapsed into a single self-referential
// atomic UPDATE. Holding the row lock across the read and the write gets the
// same guarantee: the loser blocks, then re-reads the winner's committed
// state instead of overwriting it. The lock lives only as long as the
// surrounding transaction, which is why this cannot be done
// statement-by-statement.
//
// Every transaction that recomputes a video must take this lock *first*,
// before any other write. A write to a row that references the video (a
// variant insert or delete) makes Postgres take a FOR KEY SHARE lock on the
// video row; upgrading that to FOR UPDATE afterwards lets two concurrent
// callers deadlock, each holding the shared lock and waiting on the other.
// Locking up front gives every caller the same acquisition order.
async function lockVideoRow(
  tx: Prisma.TransactionClient,
  videoId: string
): Promise<void> {
  await tx.$executeRaw`SELECT id FROM "Video" WHERE id = ${videoId} FOR UPDATE`
}

// Recomputes a video's availableLanguages from its current source data and
// writes the result, returning both the value it had and the value it now
// has. Must run inside a transaction that already holds the video's row lock
// (see `lockVideoRow`).
async function recomputeAvailableLanguages(
  tx: Prisma.TransactionClient,
  videoId: string
): Promise<{ previous: string[]; current: string[] }> {
  const previous = await getStoredAvailableLanguages(videoId, tx)
  const current = await calculateAvailableLanguages(videoId, tx)

  await tx.video.update({
    where: { id: videoId },
    data: {
      availableLanguages: {
        set: current
      }
    }
  })

  return { previous, current }
}

// Cache and search-index refreshes that follow an availableLanguages write.
// Both re-read the video from the database, so they must run *after* the
// transaction that wrote it has committed - never inside it.
async function syncVideoAfterLanguageChange(
  videoId: string,
  options: AvailableLanguagesSyncOptions
): Promise<void> {
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
}

async function recomputeAndSync(
  videoId: string,
  options: AvailableLanguagesSyncOptions
): Promise<{ previous: string[]; current: string[] }> {
  const result = await prisma.$transaction(async (tx) => {
    await lockVideoRow(tx, videoId)
    return await recomputeAvailableLanguages(tx, videoId)
  })

  await syncVideoAfterLanguageChange(videoId, options)

  return result
}

// Updates a video's availableLanguages field based on current state
// Handles both regular videos and collections
export async function updateVideoAvailableLanguages(
  videoId: string,
  options: AvailableLanguagesSyncOptions = {}
): Promise<string[]> {
  const { current } = await recomputeAndSync(videoId, options)

  return current
}

// Runs `write` and the recompute of `videoId`'s availableLanguages in a
// single transaction, so the two commit or roll back together: a recompute
// that throws must not leave a committed variant row behind with the video's
// availableLanguages permanently stale and nothing to retry it. Post-commit
// cache and Algolia syncs run once, afterwards.
//
// This is the seam for any write whose effect on a video's availableLanguages
// has to be derived rather than known up front (parent-variant create and
// cleanup); callers that already know the single language they are adding to
// a video's *own* value should use `addLanguageToVideo` instead.
export async function withAvailableLanguagesRecompute<T>(
  videoId: string,
  write: (tx: Prisma.TransactionClient) => Promise<T>,
  options: AvailableLanguagesSyncOptions = {}
): Promise<T> {
  const result = await prisma.$transaction(async (tx) => {
    await lockVideoRow(tx, videoId)
    const value = await write(tx)
    await recomputeAvailableLanguages(tx, videoId)
    return value
  })

  await syncVideoAfterLanguageChange(videoId, options)

  return result
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
// everywhere: this single statement needs no transaction and no lock wait,
// whereas the recompute path has to hold the video's row lock for the length
// of a transaction to get the same guarantee (see
// `recomputeAvailableLanguages` above). The "always fully recompute, never
// incrementally mutate" principle is applied off this hot path instead - at
// the cascade level (`updateParentCollectionLanguages` below) and wherever
// the resulting value has to be derived rather than known up front
// (`withAvailableLanguagesRecompute`).
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
  if (a.length !== b.length) return false
  const setA = new Set(a)
  return b.every((languageId) => setA.has(languageId))
}

async function getStoredAvailableLanguages(
  videoId: string,
  client: Prisma.TransactionClient = prisma
): Promise<string[]> {
  const video = await client.video.findUnique({
    where: { id: videoId },
    select: { availableLanguages: true }
  })
  return video?.availableLanguages ?? []
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

    // `previous` is read under the same row lock as the recompute, so the
    // "did this level actually change?" comparison can't be decided against a
    // value a concurrent writer has since replaced.
    const { previous, current } = await recomputeAndSync(parentId, {
      skipCache: false,
      skipAlgolia: false
    })

    if (!sameLanguageSet(previous, current)) {
      await cascadeParentCollectionLanguages(
        parentId,
        new Set([...visitedPath, parentId])
      )
    }
  }
}
