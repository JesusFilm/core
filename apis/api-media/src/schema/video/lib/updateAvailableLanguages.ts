// Shared logic for calculating and updating video availableLanguages
// Single source of truth for managing availableLanguages on videos
// Handles both regular videos and collections
// Used by video.ts, videoVariant.ts, videoPublishChildren.mutation.ts and the
// variant reconciliation / upload workers

import { Prisma, type VideoLabel, prisma } from '@core/prisma/media/client'

import { videoCacheReset } from '../../../lib/videoCacheReset'
import {
  enqueueVideoAlgoliaSync,
  videoOnlyScope
} from '../../../workers/videoAlgoliaSync'
import { logger } from '../../logger'

// The labels that can contain other videos. Shared by every parent lookup so
// "parent" has one definition across the cascade.
export const CONTAINER_VIDEO_LABELS: VideoLabel[] = [
  'collection',
  'series',
  'featureFilm'
]

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient

// A container's empty placeholder Variant (no hls, no Mux asset) only mirrors a
// language that one of its children already provides, so it must not count as
// the container's *own* variant: counting it would keep a language on the
// container after the last child providing it is removed. Written as an
// explicit OR rather than NOT { hls: '', muxVideoId: null }: in SQL, NOT over a
// NULL hls evaluates to NULL and would silently drop real variants whose hls is
// NULL.
const REAL_VARIANT_FILTER = {
  OR: [{ hls: null }, { hls: { not: '' } }, { muxVideoId: { not: null } }]
}

// Calculates what availableLanguages should be for a given video, and
// returns it alongside the value currently stored on the row. Both come off
// a single `findUnique` - the caller (e.g. the cascade walker) needs the
// stored ("previous") value too, and adding it to this same select avoids a
// second dedicated read of the same row immediately before/after this one.
// Does NOT update the database - only calculates the correct value.
// Reads through `client` so it can run inside a caller's transaction.
export async function calculateAvailableLanguages(
  videoId: string,
  client: PrismaClientOrTx = prisma
): Promise<{
  languages: string[]
  previousLanguages: string[]
}> {
  const video = await client.video.findUnique({
    where: { id: videoId },
    select: {
      label: true,
      availableLanguages: true,
      variants: {
        where: { published: true, ...REAL_VARIANT_FILTER },
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
// (see `lockVideoRow`), so `before` is read under the same lock as the write
// and a cascade's "did this level actually change?" check can't be decided
// against a value a concurrent writer has since replaced.
async function recomputeAvailableLanguages(
  tx: Prisma.TransactionClient,
  videoId: string
): Promise<{ before: string[]; after: string[] }> {
  const { languages: after, previousLanguages: before } =
    await calculateAvailableLanguages(videoId, tx)

  await tx.video.update({
    where: { id: videoId },
    data: {
      availableLanguages: {
        set: after
      }
    }
  })

  return { before, after }
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
      logger.error({ error, videoId }, 'Cache reset error')
    }
  }
}

// Updates a video's availableLanguages field based on current state, under
// the video's row lock, and returns the value it had alongside the value it
// now has. Handles both regular videos and collections.
export async function updateVideoAvailableLanguages(
  videoId: string,
  options: AvailableLanguagesSyncOptions = {}
): Promise<{ before: string[]; after: string[] }> {
  const result = await prisma.$transaction(async (tx) => {
    await lockVideoRow(tx, videoId)
    return await recomputeAvailableLanguages(tx, videoId)
  })

  await syncVideoAfterLanguageChange(videoId, options)

  return result
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
//
// `changed` reports whether the recompute altered the stored value, so a
// caller can skip the cascade to ancestors when nothing above can differ.
export async function withAvailableLanguagesRecompute<T>(
  videoId: string,
  write: (tx: Prisma.TransactionClient) => Promise<T>,
  options: AvailableLanguagesSyncOptions = {}
): Promise<{ value: T; changed: boolean }> {
  const result = await prisma.$transaction(async (tx) => {
    await lockVideoRow(tx, videoId)
    const value = await write(tx)
    const { before, after } = await recomputeAvailableLanguages(tx, videoId)
    return { value, changed: !sameLanguageSet(before, after) }
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
// The column is NOT NULL DEFAULT '{}' at the database level, but COALESCE
// stays as cheap insurance against a NULL row surviving if this code path
// deploys before the NOT NULL migration finishes applying (or a rollback
// briefly reintroduces it mid-migration): without it, a NULL row would make
// the WHERE clause evaluate to NULL and silently no-op instead of adding
// the language.
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

// Removes a language from a video's availableLanguages if no published variants use it.
//
// Reads and writes the same column `recomputeAvailableLanguages` does, on a
// video that can be an arbitrary container the cascade also recomputes - so
// it takes the same row lock first, for the same lost-update reason: without
// it, a concurrent cascade recompute could commit its value while this
// function is still reading, and this function's write would then overwrite
// that committed value with its own stale, pre-lock computation.
export async function removeLanguageFromVideoIfUnused(
  videoId: string,
  languageId: string
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await lockVideoRow(tx, videoId)

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
        in: CONTAINER_VIDEO_LABELS
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
// The walk is level-batched, per #9517: every ancestor at depth N is
// collected first and recomputed as one batch, and only then does the walk
// move to depth N+1. Batching by level is what makes a diamond ancestry
// correct. When two parents share a grandparent, that grandparent is
// collected once for its level and recomputed once in total; a depth-first
// walk would recompute it once per incoming path, which is both wasted work
// and a hazard if the two recomputes interleave.
//
// Each ancestor's value is always fully recomputed from its own current
// source data (own published variants union its live children's current
// values) rather than incrementally mutated. A level whose recomputed value
// doesn't change contributes nothing to the next level, so unaffected
// ancestors are never even queried, let alone written.
//
// Termination: an ancestor is recomputed again whenever one of its children
// changed after it was last recomputed. That is what lets a "skewed" ancestor
// (a container reachable from the changed video at two different depths, e.g.
// a collection that lists a video directly and also via a series inside it)
// settle on the deeper branch's result instead of being left stale. The walk
// stops when a level changes nothing (recomputes are idempotent, so a fixpoint
// is reached), and `MAX_CASCADE_LEVELS` bounds it so a cycle in the
// children/parents relation (A contains B, B contains A) can never run
// forever. The video that started the cascade is never recomputed by it.
//
// Failures do not stop the walk, but they are never swallowed. A failed
// recompute is recorded, that ancestor's own parents are not walked (they
// would only be recomputed from a value known to be stale), the rest of the
// level and any independent branches still complete, and the collected
// errors are rethrown as an `AggregateError` once the walk finishes - so the
// caller can retry or roll back instead of silently inheriting a stale tree.
// Upper bound on the walk's depth. Real hierarchies are 3-4 levels; this only
// ever bites on a cyclic children/parents relation.
const MAX_CASCADE_LEVELS = 25

export async function updateParentCollectionLanguages(
  childVideoId: string
): Promise<void> {
  const failures: Array<{ videoId: string; error: unknown }> = []

  let currentLevel = await collectNextLevel([childVideoId], childVideoId)
  let levelsWalked = 0

  while (currentLevel.length > 0) {
    if (++levelsWalked > MAX_CASCADE_LEVELS) {
      logger.warn(
        { childVideoId, levelsWalked },
        'availableLanguages cascade hit the level cap - a cycle in the video children/parents relation; stopping the walk'
      )
      break
    }

    // Ancestors at this depth whose recomputed value actually changed -
    // only those can affect the level above them.
    const changed: string[] = []

    for (const videoId of currentLevel) {
      try {
        const { before, after } = await updateVideoAvailableLanguages(videoId)

        if (!sameLanguageSet(before, after)) {
          changed.push(videoId)
        }
      } catch (error) {
        failures.push({ videoId, error })
        logger.error(
          { videoId, error },
          'Failed to recompute availableLanguages for an ancestor video - continuing the rest of the cascade, but the error will be rethrown'
        )
      }
    }

    currentLevel = await collectNextLevel(changed, childVideoId)
  }

  if (failures.length > 0) {
    throw new AggregateError(
      failures.map(({ error }) => error),
      `Failed to cascade availableLanguages from video ${childVideoId} to ${failures.length} ancestor video(s): ${failures
        .map(({ videoId }) => videoId)
        .join(', ')}`
    )
  }
}

// Collects the next level of the walk: the container parents of every video
// whose value changed at the level just recomputed, deduplicated. The video
// that started the cascade is excluded - the caller has already written it.
async function collectNextLevel(
  videoIds: readonly string[],
  originVideoId: string
): Promise<string[]> {
  const nextLevel = new Set<string>()

  for (const videoId of videoIds) {
    for (const parentId of await findContainerParentIds(videoId)) {
      if (parentId === originVideoId) continue
      nextLevel.add(parentId)
    }
  }

  return Array.from(nextLevel)
}
