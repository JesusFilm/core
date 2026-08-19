// Batch verifier for Video.availableLanguages.
//
// Every mutation, worker, and script writes this field through
// updateAvailableLanguages.ts's shared recompute/cascade, so in principle it
// should never drift from source data. This module is the independent check
// on that assumption: it walks the whole catalog bottom-up, recomputes every
// video's availableLanguages from source data (own published variants
// unioned with each live child's *freshly recomputed* value, not its
// possibly-stale stored value), diffs the result against what's stored, and
// can optionally self-heal by writing the corrected value.
//
// The traversal is batched level-by-level - all nodes whose children have
// already been resolved are fetched (and, if fixing, written) in one query
// per level - rather than one query per video, so running it against the
// full catalog doesn't generate an unbounded number of round trips. A video
// never reachable this way (because it sits on a cycle in the
// children/parents relation) is reported separately rather than hanging the
// walk.

import { prisma } from '@core/prisma/media/client'

import { sameLanguageSet } from './updateAvailableLanguages'

export interface AvailableLanguagesMismatch {
  videoId: string
  stored: string[]
  computed: string[]
}

export interface VerifyAvailableLanguagesOptions {
  // When true, mismatches are written back with the computed value. When
  // false (the default), the verifier only reports what it found.
  fix?: boolean
}

export interface VerifyAvailableLanguagesResult {
  // Number of videos reached by the walk (excludes cycle members).
  checked: number
  mismatches: AvailableLanguagesMismatch[]
  // Video ids that were mismatched and successfully written; only
  // populated when `fix: true`.
  fixed: string[]
  // Video ids never reached by the walk because they sit on a cycle in the
  // children/parents relation - the walk cannot compute a value for these
  // without an arbitrary tie-break, so they're surfaced for manual/data
  // repair instead.
  cycleVideoIds: string[]
}

function calculateFromSourceData(
  ownLanguageIds: string[],
  childIds: string[],
  computed: ReadonlyMap<string, string[]>
): string[] {
  const languageSet = new Set<string>(ownLanguageIds)
  for (const childId of childIds) {
    for (const languageId of computed.get(childId) ?? []) {
      languageSet.add(languageId)
    }
  }
  return Array.from(languageSet).sort((a, b) => Number(a) - Number(b))
}

export async function verifyAvailableLanguages(
  options: VerifyAvailableLanguagesOptions = {}
): Promise<VerifyAvailableLanguagesResult> {
  // One query for the whole catalog's shape (id + live children ids) - this
  // is what determines dependency order, and can't be discovered any other
  // way, but it's a single round trip rather than one per video.
  const graphNodes = await prisma.video.findMany({
    select: {
      id: true,
      children: { where: { published: true }, select: { id: true } }
    }
  })

  const childIdsOf = new Map<string, string[]>()
  const parentsOfChild = new Map<string, string[]>()
  const pendingChildCount = new Map<string, number>()

  for (const node of graphNodes) {
    const childIds = node.children.map((child) => child.id)
    childIdsOf.set(node.id, childIds)
    pendingChildCount.set(node.id, childIds.length)
    for (const childId of childIds) {
      const parents = parentsOfChild.get(childId) ?? []
      parents.push(node.id)
      parentsOfChild.set(childId, parents)
    }
  }

  const computed = new Map<string, string[]>()
  const mismatches: AvailableLanguagesMismatch[] = []
  const fixed: string[] = []

  // The first level is every video with no live children left to wait on -
  // true leaves, plus any container whose children are all unpublished.
  let level = graphNodes
    .map((node) => node.id)
    .filter((id) => (pendingChildCount.get(id) ?? 0) === 0)

  while (level.length > 0) {
    const own = await prisma.video.findMany({
      where: { id: { in: level } },
      select: {
        id: true,
        availableLanguages: true,
        variants: {
          where: { published: true },
          select: { languageId: true }
        }
      }
    })

    const nextLevel = new Set<string>()

    for (const video of own) {
      const value = calculateFromSourceData(
        video.variants.map((variant) => variant.languageId),
        childIdsOf.get(video.id) ?? [],
        computed
      )
      computed.set(video.id, value)

      if (!sameLanguageSet(video.availableLanguages ?? [], value)) {
        mismatches.push({
          videoId: video.id,
          stored: video.availableLanguages ?? [],
          computed: value
        })

        if (options.fix) {
          await prisma.video.update({
            where: { id: video.id },
            data: { availableLanguages: { set: value } }
          })
          fixed.push(video.id)
        }
      }

      for (const parentId of parentsOfChild.get(video.id) ?? []) {
        const remaining = (pendingChildCount.get(parentId) ?? 0) - 1
        pendingChildCount.set(parentId, remaining)
        if (remaining === 0) nextLevel.add(parentId)
      }
    }

    level = Array.from(nextLevel)
  }

  const cycleVideoIds = graphNodes
    .map((node) => node.id)
    .filter((id) => !computed.has(id))

  return {
    checked: computed.size,
    mismatches,
    fixed,
    cycleVideoIds
  }
}
