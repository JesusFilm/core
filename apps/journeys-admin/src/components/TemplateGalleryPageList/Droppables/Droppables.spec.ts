import { Collision } from '@dnd-kit/core'

import {
  encodeDropZoneId,
  parseDropZoneId,
  resolveSectionDropCollisions
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

describe('resolveSectionDropCollisions', () => {
  const collision = (id: string): Collision => ({ id })
  const ids = (collisions: Collision[]): string[] =>
    collisions.map((c) => String(c.id))
  const collectionX = encodeDropZoneId({ kind: 'collection', id: 'X' })
  const unsectioned = encodeDropZoneId({ kind: 'unsectioned' })
  const membership = (
    entries: Array<[string, string]>
  ): ReadonlyMap<string, { id: string }> =>
    new Map(entries.map(([templateId, colId]) => [templateId, { id: colId }]))

  it('returns the input unchanged when there are no collisions', () => {
    expect(resolveSectionDropCollisions([], 'j1', membership([]))).toEqual([])
  })

  it('remaps a card hit to its collection when moving in from the unsectioned pool', () => {
    // Cursor over card j-in-x (which lives in collection X); the dragged card
    // is unsectioned → the whole collection is the drop zone.
    const collisions = [collision('j-in-x'), collision(collectionX)]
    const result = resolveSectionDropCollisions(
      collisions,
      'j-unsectioned',
      membership([['j-in-x', 'X']])
    )
    expect(ids(result)).toEqual([collectionX])
  })

  it('remaps a card hit to its collection when moving in from a different collection', () => {
    const collisions = [collision('j-in-x'), collision(collectionX)]
    const result = resolveSectionDropCollisions(
      collisions,
      'j-src',
      membership([
        ['j-in-x', 'X'],
        ['j-src', 'Y']
      ])
    )
    expect(ids(result)).toEqual([collectionX])
  })

  it('keeps the specific card for a reorder within the same collection', () => {
    // Dragged card j1 and the hovered card j2 both live in X → keep the card
    // target so the existing reorder path lands it at that slot.
    const collisions = [collision('j2'), collision(collectionX)]
    const result = resolveSectionDropCollisions(
      collisions,
      'j1',
      membership([
        ['j1', 'X'],
        ['j2', 'X']
      ])
    )
    expect(result).toBe(collisions)
  })

  it('returns the collection container when the cursor is over the empty area', () => {
    const collisions = [collision(collectionX)]
    const result = resolveSectionDropCollisions(
      collisions,
      'j-unsectioned',
      membership([])
    )
    expect(ids(result)).toEqual([collectionX])
  })

  it('targets the unsectioned zone when dragging a collection card over it', () => {
    // Moving a collection card out to the unsectioned pool, cursor over one of
    // its cards → the whole unsectioned pool is the drop zone.
    const collisions = [collision('j-unsectioned'), collision(unsectioned)]
    const result = resolveSectionDropCollisions(
      collisions,
      'j-src',
      membership([['j-src', 'A']])
    )
    expect(ids(result)).toEqual([unsectioned])
  })

  it('leaves card-only collisions untouched (no section under the cursor)', () => {
    const collisions = [collision('jA'), collision('jB')]
    const result = resolveSectionDropCollisions(
      collisions,
      'jA',
      membership([])
    )
    expect(result).toBe(collisions)
  })
})
