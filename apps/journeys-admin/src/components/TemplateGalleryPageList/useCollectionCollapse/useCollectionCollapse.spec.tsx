import { act, renderHook } from '@testing-library/react'

import {
  getCollapsedCollectionIds,
  setCollapsedCollectionIds
} from './collectionCollapseStorage'
import { useCollectionCollapse } from './useCollectionCollapse'

describe('collectionCollapseStorage', () => {
  beforeEach(() => localStorage.clear())

  it('returns an empty list when nothing is stored', () => {
    expect(getCollapsedCollectionIds('team-1')).toEqual([])
  })

  it('round-trips collapsed ids isolated per team', () => {
    setCollapsedCollectionIds('team-1', ['a', 'b'])
    setCollapsedCollectionIds('team-2', ['c'])
    expect(getCollapsedCollectionIds('team-1')).toEqual(['a', 'b'])
    expect(getCollapsedCollectionIds('team-2')).toEqual(['c'])
  })

  it('returns an empty list for malformed stored values', () => {
    localStorage.setItem('templateCollectionsCollapse:team-1', 'not json')
    expect(getCollapsedCollectionIds('team-1')).toEqual([])
  })
})

describe('useCollectionCollapse', () => {
  beforeEach(() => localStorage.clear())

  it('defaults every collection to expanded', () => {
    const { result } = renderHook(() => useCollectionCollapse('team-1'))
    expect(result.current.isCollapsed('a')).toBe(false)
  })

  it('toggles collapsed state and persists it per team', () => {
    const { result } = renderHook(() => useCollectionCollapse('team-1'))

    act(() => result.current.toggle('a'))
    expect(result.current.isCollapsed('a')).toBe(true)
    expect(getCollapsedCollectionIds('team-1')).toEqual(['a'])

    act(() => result.current.toggle('a'))
    expect(result.current.isCollapsed('a')).toBe(false)
    expect(getCollapsedCollectionIds('team-1')).toEqual([])
  })

  it('loads persisted collapsed ids on mount', () => {
    setCollapsedCollectionIds('team-1', ['x'])
    const { result } = renderHook(() => useCollectionCollapse('team-1'))
    expect(result.current.isCollapsed('x')).toBe(true)
  })

  it('reloads the collapsed set when the team changes', () => {
    setCollapsedCollectionIds('team-1', ['x'])
    setCollapsedCollectionIds('team-2', ['y'])
    const { result, rerender } = renderHook(
      ({ teamId }: { teamId: string | undefined }) =>
        useCollectionCollapse(teamId),
      { initialProps: { teamId: 'team-1' as string | undefined } }
    )
    expect(result.current.isCollapsed('x')).toBe(true)
    expect(result.current.isCollapsed('y')).toBe(false)

    rerender({ teamId: 'team-2' })
    expect(result.current.isCollapsed('y')).toBe(true)
    expect(result.current.isCollapsed('x')).toBe(false)
  })

  it('is a no-op when there is no active team', () => {
    const { result } = renderHook(() => useCollectionCollapse(undefined))
    act(() => result.current.toggle('a'))
    expect(result.current.isCollapsed('a')).toBe(false)
  })

  it('survives a full unmount/remount via localStorage alone', () => {
    // Proves the toggle->persist->reload loop end-to-end without re-seeding
    // storage by hand: a fresh hook instance must recover the state.
    const first = renderHook(() => useCollectionCollapse('team-1'))
    act(() => first.result.current.toggle('a'))
    expect(first.result.current.isCollapsed('a')).toBe(true)
    first.unmount()

    const second = renderHook(() => useCollectionCollapse('team-1'))
    expect(second.result.current.isCollapsed('a')).toBe(true)
  })

  it('prunes stored ids for collections that no longer exist', () => {
    setCollapsedCollectionIds('team-1', ['a', 'b'])
    // 'b' is no longer among the live collections → it must be dropped from
    // both state and storage so the persisted set can't grow unbounded.
    const { result } = renderHook(() =>
      useCollectionCollapse('team-1', ['a'])
    )
    expect(result.current.isCollapsed('a')).toBe(true)
    expect(result.current.isCollapsed('b')).toBe(false)
    expect(getCollapsedCollectionIds('team-1')).toEqual(['a'])
  })

  it('does not prune while the collections list is empty (still loading)', () => {
    setCollapsedCollectionIds('team-1', ['a'])
    const { result } = renderHook(() => useCollectionCollapse('team-1', []))
    expect(result.current.isCollapsed('a')).toBe(true)
    expect(getCollapsedCollectionIds('team-1')).toEqual(['a'])
  })
})
