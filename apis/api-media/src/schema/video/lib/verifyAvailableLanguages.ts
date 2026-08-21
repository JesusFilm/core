// Batch verifier for Video.availableLanguages.
//
// Every mutation and worker is supposed to keep this field in sync via
// updateAvailableLanguages.ts's shared recompute, so in principle it should
// never drift from source data. This module is the independent check on
// that assumption: it walks the whole catalog bottom-up, recomputes every
// video's availableLanguages the same way calculateAvailableLanguages does
// (own published variant languages, unioned with each live child's
// *current stored* value), diffs the result against what's actually
// stored, and can optionally self-heal by writing the corrected value.
//
// The traversal is batched level-by-level -- one query fetches every
// video's own data (variants + children) for a given depth in the
// children/parents hierarchy, not one query per video. Processing is
// bottom-up (leaves first) so that in fix mode a correction made at one
// level is visible, already committed, when its parent is checked a moment
// later -- a whole drifted branch can self-heal in a single walk.
//
// The walk is also paginated: each call does at most `pageSize` videos of
// work (across levels; the exact page size only matters as a cap on a
// single call's cost) and returns a `nextCursor`. Passing that cursor back
// in resumes exactly where the previous call left off, so verifying a
// large catalog is a sequence of bounded calls -- following the reconciliation
// worker's sweep pattern (bounded batch per invocation, not a single
// unbounded pass) -- rather than one call that must run to completion.
//
// A video that sits on a cycle in the children/parents relation (or
// depends, transitively, on one) never has all of its live children
// resolved, so it never reaches pendingChildCount 0 and is never assigned a
// level. The walk simply never reaches such a video -- rather than looping
// forever -- and every id like that is reported in `unresolvedVideoIds` for
// separate investigation/repair; it is never included in `checked`, and
// never compared or fixed.
//
// The graph (level assignment + unresolved ids) is derived fresh from the
// children/parents relation on every call by default -- cheap on its own
// (ids only), but repeating it for every page of a large catalog is
// wasteful. A caller that already knows the graph for this run (the
// runVerifyAvailableLanguages driver does) can pass it in via the `graph`
// option to skip that recomputation; see the note on `graph` below for what
// that trades away.

import { prisma } from '@core/prisma/media/client'

export interface AvailableLanguagesMismatch {
  videoId: string
  stored: string[]
  computed: string[]
}

// Identifies where a paginated walk left off: the level index being
// processed, and the last video id already handled within that level (null
// means "start of the level").
//
// This cursor is only meaningful relative to a specific graph. Level
// membership is derived from the children/parents relation, so if a video
// is published, unpublished, or reparented between the call that produced
// this cursor and the call resuming from it, level membership can shift
// under the cursor -- resuming can then skip a video or re-check one
// already covered. Two cases in practice:
// - Calling verifyAvailableLanguages() directly across multiple calls
//   without passing `graph`: each call re-derives the graph fresh, so this
//   is a real (if narrow) risk. Full coverage is only guaranteed for a walk
//   that completes within one stable window.
// - Calling it via the graph option (as runVerifyAvailableLanguages does):
//   the graph is fixed for the whole run, so the cursor's meaning can't
//   drift mid-run -- but the run also won't notice a structural change
//   until its next fresh run picks up a new graph.
export interface VerifyAvailableLanguagesCursor {
  level: number
  afterId: string | null
}

// The topologically-ordered levels (bottom-up: leaves first) and the ids
// the walk can never reach, as computed by computeAvailableLanguagesGraph.
export interface AvailableLanguagesGraph {
  levels: string[][]
  unresolvedVideoIds: string[]
}

export interface VerifyAvailableLanguagesOptions {
  // When true, mismatches are written back with the computed value. When
  // false (the default), the verifier only reports what it found.
  fix?: boolean
  // Resume a previous call's walk. Omit (or pass null) to start from the
  // beginning of the catalog.
  cursor?: VerifyAvailableLanguagesCursor | null
  // Upper bound on how many videos this call will check. Defaults to a
  // generous size so a normal-sized catalog completes in one call; pass a
  // smaller value to force multi-call pagination (as a large catalog would
  // hit naturally).
  pageSize?: number
  // Reuse a graph computed by an earlier call in the same run instead of
  // deriving it again from the children/parents relation. Passing this in
  // turns a multi-call walk from one graph load per page into one per run,
  // at the cost of that run no longer reacting to videos published,
  // unpublished, or reparented after the graph was computed -- see the
  // caveat on VerifyAvailableLanguagesCursor. Omit to derive the graph
  // fresh, as every call did before this option existed.
  graph?: AvailableLanguagesGraph
}

export interface VerifyAvailableLanguagesResult {
  // Number of videos this call actually compared (excludes videos skipped
  // by pagination in a previous or future call, and excludes unresolved
  // videos, which are never compared).
  checked: number
  mismatches: AvailableLanguagesMismatch[]
  // Video ids that were mismatched and successfully written; only
  // populated when `fix: true`.
  fixed: string[]
  // Video ids the walk could not reach because they sit on a cycle in the
  // children/parents relation, or depend on one. Derived from the graph for
  // this call -- fresh every time by default, or fixed for the run when the
  // caller supplied `graph` (see the `graph` option) -- regardless of
  // pagination progress.
  unresolvedVideoIds: string[]
  // Pass this back in to continue the walk. Null means the whole catalog
  // (everything reachable, i.e. everything not in unresolvedVideoIds) has
  // now been checked.
  nextCursor: VerifyAvailableLanguagesCursor | null
}

const DEFAULT_PAGE_SIZE = 500

// True when two availableLanguages values represent the same set,
// irrespective of order.
function sameLanguageSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const setA = new Set(a)
  return b.every((languageId) => setA.has(languageId))
}

// Derives the topologically-ordered levels (Kahn's algorithm over the
// children/parents relation) and the ids the walk can never reach. This is
// a single lightweight query for the whole catalog's shape -- id and live
// (published) children ids only, not the heavier per-video data (variants,
// stored availableLanguages) fetched in bounded pages by verifyAvailableLanguages
// itself. Exported so a multi-call driver can compute it once per run and
// pass it to every call via the `graph` option, instead of paying for this
// on every page.
export async function computeAvailableLanguagesGraph(): Promise<AvailableLanguagesGraph> {
  const graphNodes = await prisma.video.findMany({
    select: {
      id: true,
      children: { where: { published: true }, select: { id: true } }
    }
  })

  const pendingChildCount = new Map<string, number>()
  const parentsOfChild = new Map<string, string[]>()

  for (const node of graphNodes) {
    const childIds = node.children.map((child) => child.id)
    pendingChildCount.set(node.id, childIds.length)
    for (const childId of childIds) {
      const parents = parentsOfChild.get(childId) ?? []
      parents.push(node.id)
      parentsOfChild.set(childId, parents)
    }
  }

  // Kahn's algorithm: level 0 is every video with no live children left to
  // wait on (true leaves, plus any container whose children are all
  // unpublished). Level n+1 is every video whose last remaining live child
  // just resolved at level n.
  const levels: string[][] = []
  let frontier = graphNodes
    .map((node) => node.id)
    .filter((id) => (pendingChildCount.get(id) ?? 0) === 0)

  while (frontier.length > 0) {
    levels.push(frontier)
    const next = new Set<string>()
    for (const id of frontier) {
      for (const parentId of parentsOfChild.get(id) ?? []) {
        const remaining = (pendingChildCount.get(parentId) ?? 0) - 1
        pendingChildCount.set(parentId, remaining)
        if (remaining === 0) next.add(parentId)
      }
    }
    frontier = Array.from(next)
  }

  const resolvedIds = new Set(levels.flat())
  const unresolvedVideoIds = graphNodes
    .map((node) => node.id)
    .filter((id) => !resolvedIds.has(id))

  return { levels, unresolvedVideoIds }
}

export async function verifyAvailableLanguages(
  options: VerifyAvailableLanguagesOptions = {}
): Promise<VerifyAvailableLanguagesResult> {
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE
  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new Error(`pageSize must be a positive integer, received ${pageSize}`)
  }
  const startLevel = options.cursor?.level ?? 0
  let afterId = options.cursor?.afterId ?? null

  const { levels, unresolvedVideoIds } =
    options.graph ?? (await computeAvailableLanguagesGraph())

  const mismatches: AvailableLanguagesMismatch[] = []
  const fixed: string[] = []
  let checked = 0
  let budget = pageSize
  let levelIndex = startLevel

  while (levelIndex < levels.length && budget > 0) {
    const levelIds = levels[levelIndex]
    const take = budget

    const page = await prisma.video.findMany({
      where: { id: { in: levelIds } },
      orderBy: { id: 'asc' },
      take,
      ...(afterId != null ? { cursor: { id: afterId }, skip: 1 } : {}),
      select: {
        id: true,
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

    for (const video of page) {
      checked++

      const languageSet = new Set<string>()
      for (const variant of video.variants) {
        languageSet.add(variant.languageId)
      }
      for (const child of video.children) {
        for (const languageId of child.availableLanguages) {
          languageSet.add(languageId)
        }
      }
      const computed = Array.from(languageSet).sort(
        (a, b) => Number(a) - Number(b)
      )

      if (!sameLanguageSet(video.availableLanguages, computed)) {
        mismatches.push({
          videoId: video.id,
          stored: video.availableLanguages,
          computed
        })

        if (options.fix) {
          // Guard against a concurrent publish/unpublish landing between
          // this read and this write: only apply the correction if
          // availableLanguages still holds the exact value we just read
          // it as. If it doesn't, some other write already changed it out
          // from under us -- leave it alone rather than clobbering
          // whatever that write produced; the next verification pass will
          // re-check it against its now-current state.
          const updateResult = await prisma.video.updateMany({
            where: {
              id: video.id,
              availableLanguages: { equals: video.availableLanguages }
            },
            data: { availableLanguages: { set: computed } }
          })
          if (updateResult.count > 0) {
            fixed.push(video.id)
          }
        }
      }
    }

    budget -= page.length

    // A short page (fewer rows than asked for) means this level is fully
    // consumed -- move on. A full page might have exhausted the level
    // exactly, in which case the next call's query for it simply returns
    // an empty page and advances; that extra round trip is the price of
    // not knowing a level's exact remaining count without a second query.
    if (page.length < take) {
      levelIndex++
      afterId = null
    } else {
      afterId = page.at(-1)?.id ?? null
    }
  }

  const done = levelIndex >= levels.length

  return {
    checked,
    mismatches,
    fixed,
    unresolvedVideoIds,
    nextCursor: done ? null : { level: levelIndex, afterId }
  }
}
