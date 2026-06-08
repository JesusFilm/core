import { useCallback, useEffect, useState } from 'react'

import {
  getCollapsedCollectionIds,
  setCollapsedCollectionIds
} from './collectionCollapseStorage'

export interface UseCollectionCollapseResult {
  /** True when the collection is currently collapsed. Default is expanded. */
  isCollapsed: (collectionId: string) => boolean
  /** Flip a collection's collapsed state and persist the change. */
  toggle: (collectionId: string) => void
}

/**
 * Tracks which collections are collapsed on the Team Templates tab and
 * persists the set per team in localStorage (NES-1717). The default is
 * expanded — a collection is collapsed only if the user collapsed it.
 *
 * localStorage is read in an effect (client-only) so the first render
 * matches the SSR markup (all expanded) and the stored set is applied after
 * mount. State is also reset and reloaded whenever the active team changes.
 *
 * @param liveCollectionIds the ids of the collections currently shown. When
 *   provided, stored ids that no longer match a live collection (e.g. the
 *   collection was deleted) are pruned from state and storage so the
 *   persisted set can't grow unbounded.
 */
export function useCollectionCollapse(
  teamId: string | undefined,
  liveCollectionIds?: readonly string[]
): UseCollectionCollapseResult {
  const [collapsedIds, setCollapsedIds] = useState<ReadonlySet<string>>(
    () => new Set()
  )

  useEffect(() => {
    if (teamId == null) {
      setCollapsedIds(new Set())
      return
    }
    setCollapsedIds(new Set(getCollapsedCollectionIds(teamId)))
  }, [teamId])

  // Garbage-collect ids for collections that no longer exist. Guarded on a
  // non-empty list so a still-loading (or genuinely empty) collections query
  // can't wipe the freshly-loaded set. Runs after the load effect; the
  // functional updater sees the loaded set.
  useEffect(() => {
    if (teamId == null || liveCollectionIds == null) return
    if (liveCollectionIds.length === 0) return
    const live = new Set(liveCollectionIds)
    setCollapsedIds((prev) => {
      let changed = false
      const next = new Set<string>()
      for (const id of prev) {
        if (live.has(id)) next.add(id)
        else changed = true
      }
      if (!changed) return prev
      setCollapsedCollectionIds(teamId, [...next])
      return next
    })
  }, [teamId, liveCollectionIds])

  const isCollapsed = useCallback(
    (collectionId: string): boolean => collapsedIds.has(collectionId),
    [collapsedIds]
  )

  const toggle = useCallback(
    (collectionId: string): void => {
      if (teamId == null) return
      // Functional updater so `toggle` doesn't close over `collapsedIds`: its
      // identity stays stable across toggles (preserving the React.memo on
      // each CollectionCard) and two toggles in the same tick can't clobber
      // each other. Persisting inside the updater keeps the write in lockstep
      // with the state it derives from.
      setCollapsedIds((prev) => {
        const next = new Set(prev)
        if (next.has(collectionId)) next.delete(collectionId)
        else next.add(collectionId)
        setCollapsedCollectionIds(teamId, [...next])
        return next
      })
    },
    [teamId]
  )

  return { isCollapsed, toggle }
}
