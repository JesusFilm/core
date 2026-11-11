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

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient

// The rows every availableLanguages calculation reads, single or batched.
const availableLanguagesSelect = {
  label: true,
  variants: {
    where: { published: true },
    select: { languageId: true }
  },
  children: {
    where: { published: true },
    select: { availableLanguages: true }
  }
} as const

interface AvailableLanguagesSource {
  variants: Array<{ languageId: string }>
  children: Array<{ availableLanguages: string[] }>
}

// The calculation itself, over rows already loaded. Both the single-video and
// batched entry points below reduce through here, so there is exactly one
// definition of what a video's availableLanguages means.
function reduceAvailableLanguages(video: AvailableLanguagesSource): string[] {
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

// Calculates what availableLanguages should be for a given video
// Does NOT update the database - only calculates the correct value
export async function calculateAvailableLanguages(
  videoId: string,
  client: PrismaClientOrTx = prisma
): Promise<string[]> {
  const video = await client.video.findUnique({
    where: { id: videoId },
    select: availableLanguagesSelect
  })

  if (video == null) {
    return []
  }

  return reduceAvailableLanguages(video)
}

// Batched form of calculateAvailableLanguages: one findMany for the whole set
// rather than a lookup per id. Callers that recompute many videos at once (the
// seed job walks the entire Video table) must use this - a per-id loop makes
// their read cost grow with the catalog. Ids with no matching video are absent
// from the returned map, mirroring calculateAvailableLanguages' empty result.
export async function calculateAvailableLanguagesForVideos(
  videoIds: string[]
): Promise<Map<string, string[]>> {
  if (videoIds.length === 0) {
    return new Map()
  }

  const videos = await prisma.video.findMany({
    where: { id: { in: videoIds } },
    select: { id: true, ...availableLanguagesSelect }
  })

  return new Map(
    videos.map((video) => [video.id, reduceAvailableLanguages(video)])
  )
}

interface AvailableLanguagesWriteOptions {
  skipCache?: boolean
  skipAlgolia?: boolean
  client?: PrismaClientOrTx
}

// Writes one video's already-computed availableLanguages and runs the cache
// and search side effects. Split out of updateVideoAvailableLanguages so
// batched callers can reuse the write half against languages they resolved in
// a single lookup, rather than re-reading each video to get them.
async function applyAvailableLanguages(
  videoId: string,
  availableLanguages: string[],
  options: AvailableLanguagesWriteOptions
): Promise<string[]> {
  const client = options.client ?? prisma

  // Update the video
  await client.video.update({
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

// Updates a video's availableLanguages field based on current state
// Handles both regular videos and collections
export async function updateVideoAvailableLanguages(
  videoId: string,
  options: AvailableLanguagesWriteOptions = {}
): Promise<string[]> {
  const availableLanguages = await calculateAvailableLanguages(
    videoId,
    options.client ?? prisma
  )

  return applyAvailableLanguages(videoId, availableLanguages, options)
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

interface ParentDependencyOrder {
  orderedParentIds: string[]
  parentsWithSiblingDependency: Set<string>
}

// findContainerParentIds' results are independent of each other whenever
// none of them is itself a child of another one of them. That assumption
// breaks for a diamond shape: a clip sitting directly inside both a series
// and the collection that contains that series. The collection then needs
// the series' freshly recomputed languages, not the pre-update value a
// single batched snapshot would otherwise freeze in. Orders the batch by
// that containment - restricted to this batch, via childIds, the same field
// videoVariant.ts and reconcileParentVariants treat as authoritative for
// parent/child lookups - so dependents are written after what they depend
// on, and reports which parents have such a dependency so the caller knows
// to re-derive them instead of trusting the batched value.
function orderParentsByDependency(
  parentIds: string[],
  childIdsByParentId: Map<string, string[]>
): ParentDependencyOrder {
  const parentIdSet = new Set(parentIds)
  const dependencies = new Map(
    parentIds.map((id) => [
      id,
      (childIdsByParentId.get(id) ?? []).filter((childId) =>
        parentIdSet.has(childId)
      )
    ])
  )

  const dependents = new Map<string, string[]>()
  const remainingDependencyCount = new Map<string, number>()
  for (const [parentId, deps] of dependencies) {
    remainingDependencyCount.set(parentId, deps.length)
    for (const dep of deps) {
      dependents.set(dep, [...(dependents.get(dep) ?? []), parentId])
    }
  }

  const queue = parentIds.filter(
    (id) => remainingDependencyCount.get(id) === 0
  )
  const orderedParentIds: string[] = []
  while (queue.length > 0) {
    const id = queue.shift() as string
    orderedParentIds.push(id)
    for (const dependent of dependents.get(id) ?? []) {
      const remaining = (remainingDependencyCount.get(dependent) ?? 0) - 1
      remainingDependencyCount.set(dependent, remaining)
      if (remaining === 0) {
        queue.push(dependent)
      }
    }
  }

  // Two of these parents directly containing each other is already
  // inconsistent data this function cannot resolve - fall back to the
  // original order rather than dropping a parent from the update.
  if (orderedParentIds.length < parentIds.length) {
    return {
      orderedParentIds: parentIds,
      parentsWithSiblingDependency: new Set()
    }
  }

  const parentsWithSiblingDependency = new Set(
    [...dependencies.entries()]
      .filter(([, deps]) => deps.length > 0)
      .map(([id]) => id)
  )

  return { orderedParentIds, parentsWithSiblingDependency }
}

// Updates all parent videos (collections) when a child video's languages change
// Ensures collections always reflect the union of their children's languages
//
// The parents are recomputed from one batched lookup rather than a lookup
// each, kept to the same two-read budget as before by asking this single
// query for childIds too. A parent with no sibling dependency in this batch
// uses that snapshot value directly; a parent that depends on a sibling
// (see orderParentsByDependency above) is written after that sibling and
// re-derived with a fresh read at that point, so it picks up the sibling's
// just-written value rather than the snapshot's stale one.
//
// The writes stay per-parent: the Algolia enqueue and cache reset are
// per-video side effects, and keeping the updates separate preserves the
// existing behaviour where a failure on one parent leaves earlier parents
// committed.
export async function updateParentCollectionLanguages(
  childVideoId: string
): Promise<void> {
  const parentIds = await findContainerParentIds(childVideoId)

  if (parentIds.length === 0) {
    return
  }

  const parents = await prisma.video.findMany({
    where: { id: { in: parentIds } },
    select: { id: true, childIds: true, ...availableLanguagesSelect }
  })

  const availableLanguagesByVideoId = new Map(
    parents.map((video) => [video.id, reduceAvailableLanguages(video)])
  )
  const childIdsByParentId = new Map(
    parents.map((video) => [video.id, video.childIds])
  )
  const { orderedParentIds, parentsWithSiblingDependency } =
    orderParentsByDependency(parentIds, childIdsByParentId)

  // Update each parent collection
  for (const parentId of orderedParentIds) {
    const availableLanguages = parentsWithSiblingDependency.has(parentId)
      ? await calculateAvailableLanguages(parentId)
      : availableLanguagesByVideoId.get(parentId) ?? []

    await applyAvailableLanguages(parentId, availableLanguages, {
      skipCache: false,
      skipAlgolia: false
    })
  }
}
