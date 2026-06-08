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
 */
export function useCollectionCollapse(
  teamId: string | undefined
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

  const isCollapsed = useCallback(
    (collectionId: string): boolean => collapsedIds.has(collectionId),
    [collapsedIds]
  )

  const toggle = useCallback(
    (collectionId: string): void => {
      if (teamId == null) return
      const next = new Set(collapsedIds)
      if (next.has(collectionId)) next.delete(collectionId)
      else next.add(collectionId)
      setCollapsedIds(next)
      setCollapsedCollectionIds(teamId, [...next])
    },
    [collapsedIds, teamId]
  )

  return { isCollapsed, toggle }
}
