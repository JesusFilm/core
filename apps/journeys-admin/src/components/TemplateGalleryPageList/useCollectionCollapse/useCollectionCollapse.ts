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

interface CollapseState {
  /**
   * The team whose storage `ids` was loaded from, or `undefined` before the
   * first load / when no team is active. The persist and prune effects key
   * everything off this field — never the (possibly newer) `teamId` prop —
   * so one team's ids can never be written to another team's storage, even
   * transiently during a team switch.
   */
  teamId: string | undefined
  ids: ReadonlySet<string>
}

const EMPTY_STATE: CollapseState = { teamId: undefined, ids: new Set() }

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
 *   persisted set can't grow unbounded. Callers must derive this from a
 *   query keyed on the same `teamId` in the same render; a loading query
 *   should yield `undefined` or `[]` (both are no-ops below), never another
 *   team's ids.
 */
export function useCollectionCollapse(
  teamId: string | undefined,
  liveCollectionIds?: readonly string[]
): UseCollectionCollapseResult {
  const [state, setState] = useState<CollapseState>(EMPTY_STATE)

  useEffect(() => {
    if (teamId == null) {
      setState(EMPTY_STATE)
      return
    }
    setState({ teamId, ids: new Set(getCollapsedCollectionIds(teamId)) })
  }, [teamId])

  // Persist whenever the in-memory set changes. A separate effect — rather
  // than a write inside the state updaters below — so StrictMode's
  // double-invoked updaters can't double-write. Skipped until the load
  // effect has seeded `state.teamId`, so the pre-load empty set is never
  // written; re-writing a just-loaded set is an identical, harmless write.
  useEffect(() => {
    if (state.teamId == null) return
    setCollapsedCollectionIds(state.teamId, [...state.ids])
  }, [state])

  // Garbage-collect ids for collections that no longer exist. Three guards
  // make this safe across loading states and team switches:
  // 1. `liveCollectionIds == null` — collections query not started/loading:
  //    nothing to prune against, skip.
  // 2. `length === 0` — still-loading (or genuinely empty) list: skip, so a
  //    transient empty list can't wipe a freshly-loaded set.
  // 3. `prev.teamId !== teamId` — state still belongs to the previous team
  //    mid-switch: skip until the load effect above has re-seeded. (The load
  //    effect runs first in the same commit, so by the time this updater is
  //    applied the seeded state is what `prev` holds.)
  useEffect(() => {
    if (teamId == null || liveCollectionIds == null) return
    if (liveCollectionIds.length === 0) return
    const live = new Set(liveCollectionIds)
    setState((prev) => {
      if (prev.teamId !== teamId) return prev
      let changed = false
      const next = new Set<string>()
      for (const id of prev.ids) {
        if (live.has(id)) next.add(id)
        else changed = true
      }
      if (!changed) return prev
      return { teamId: prev.teamId, ids: next }
    })
  }, [teamId, liveCollectionIds])

  const isCollapsed = useCallback(
    (collectionId: string): boolean => state.ids.has(collectionId),
    [state.ids]
  )

  const toggle = useCallback((collectionId: string): void => {
    // Functional updater so `toggle` doesn't close over state: its identity
    // stays stable across toggles (preserving the React.memo on each
    // CollectionCard) and two toggles in the same tick can't clobber each
    // other. Persistence happens in the effect above, keyed to the team the
    // state was loaded for.
    setState((prev) => {
      if (prev.teamId == null) return prev
      const next = new Set(prev.ids)
      if (next.has(collectionId)) next.delete(collectionId)
      else next.add(collectionId)
      return { teamId: prev.teamId, ids: next }
    })
  }, [])

  return { isCollapsed, toggle }
}
