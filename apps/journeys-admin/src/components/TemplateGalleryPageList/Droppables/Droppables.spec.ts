import { Collision } from '@dnd-kit/core'

import {
  encodeDropZoneId,
  parseDropZoneId,
  resolveSectionDrop
} from './Droppables'

describe('encodeDropZoneId / parseDropZoneId', () => {
  it('round-trips an unsectioned zone', () => {
    const encoded = encodeDropZoneId({ kind: 'unsectioned' })
    expect(encoded).toBe('unsectioned')
    expect(parseDropZoneId(encoded)).toEqual({ kind: 'unsectioned' })
  })

  it('round-trips a collection zone', () => {
    const encoded = encodeDropZoneId({ kind: 'collection', id: 'page-7' })
    expect(encoded).toBe('collection:page-7')
    expect(parseDropZoneId(encoded)).toEqual({
      kind: 'collection',
      id: 'page-7'
    })
  })

  it('preserves the collection id even when it contains a colon', () => {
    const encoded = encodeDropZoneId({
      kind: 'collection',
      id: 'page:with:colons'
    })
    expect(parseDropZoneId(encoded)).toEqual({
      kind: 'collection',
      id: 'page:with:colons'
    })
  })

  it('returns null when the raw id is neither a journey-card id nor a known zone', () => {
    // Bare ids (e.g. journey-card uuids) don't match either prefix and
    // signal "this is a sortable item, not a zone wrapper" to the caller.
    expect(parseDropZoneId('j-uuid-123')).toBe(null)
  })
})

describe('resolveSectionDrop', () => {
  const collision = (id: string): Collision => ({ id })
  const collectionX = encodeDropZoneId({ kind: 'collection', id: 'X' })
  const unsectioned = encodeDropZoneId({ kind: 'unsectioned' })
  const membership = (
    entries: Array<[string, string]>
  ): ReadonlyMap<string, { id: string }> =>
    new Map(entries.map(([templateId, colId]) => [templateId, { id: colId }]))

  it('passes through when no section is under the cursor', () => {
    const collisions = [collision('jA'), collision('jB')]
    expect(resolveSectionDrop(collisions, 'jA', membership([]))).toEqual({
      kind: 'passthrough'
    })
  })

  it('targets the collection when moving in from the unsectioned pool', () => {
    // Cursor over card j-in-x (in collection X); dragged card is unsectioned →
    // the whole collection is the drop zone.
    const collisions = [collision('j-in-x'), collision(collectionX)]
    const result = resolveSectionDrop(
      collisions,
      'j-unsectioned',
      membership([['j-in-x', 'X']])
    )
    expect(result).toEqual({
      kind: 'section',
      collision: collision(collectionX)
    })
  })

  it('targets the collection when moving in from a different collection', () => {
    const collisions = [collision('j-in-x'), collision(collectionX)]
    const result = resolveSectionDrop(
      collisions,
      'j-src',
      membership([
        ['j-in-x', 'X'],
        ['j-src', 'Y']
      ])
    )
    expect(result).toEqual({
      kind: 'section',
      collision: collision(collectionX)
    })
  })

  it('signals a reorder when the dragged card belongs to the collection under the cursor', () => {
    // Whether the cursor is over a card OR the container gap, a same-collection
    // drag resolves to reorder so the caller can find the nearest in-collection
    // slot. Here the container ranks first (cursor in a gap) — must still
    // reorder, not no-op.
    const collisions = [collision(collectionX), collision('j2')]
    const result = resolveSectionDrop(
      collisions,
      'j1',
      membership([
        ['j1', 'X'],
        ['j2', 'X']
      ])
    )
    expect(result).toEqual({ kind: 'reorder', collectionId: 'X' })
  })

  it('targets the collection when the cursor is over its empty area', () => {
    const collisions = [collision(collectionX)]
    const result = resolveSectionDrop(
      collisions,
      'j-unsectioned',
      membership([])
    )
    expect(result).toEqual({
      kind: 'section',
      collision: collision(collectionX)
    })
  })

  it('targets the unsectioned zone when dragging a collection card over it', () => {
    // Moving a collection card out to the unsectioned pool → the whole pool is
    // the drop zone (unsectioned has no reorder, so it's a plain section).
    const collisions = [collision('j-unsectioned'), collision(unsectioned)]
    const result = resolveSectionDrop(
      collisions,
      'j-src',
      membership([['j-src', 'A']])
    )
    expect(result).toEqual({
      kind: 'section',
      collision: collision(unsectioned)
    })
  })
})
