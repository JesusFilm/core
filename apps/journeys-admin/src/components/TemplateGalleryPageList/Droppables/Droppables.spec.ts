import { Collision } from '@dnd-kit/core'

import {
  encodeCardId,
  encodeDropZoneId,
  parseCardId,
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

  it('round-trips a move / link action zone', () => {
    const move = encodeDropZoneId({
      kind: 'action',
      collectionId: 'page-7',
      action: 'move'
    })
    expect(move).toBe('action:move:page-7')
    expect(parseDropZoneId(move)).toEqual({
      kind: 'action',
      collectionId: 'page-7',
      action: 'move'
    })
    expect(parseDropZoneId('action:link:page:with:colons')).toEqual({
      kind: 'action',
      collectionId: 'page:with:colons',
      action: 'link'
    })
  })

  it('rejects an action zone with an unknown action', () => {
    expect(parseDropZoneId('action:copy:page-7')).toBe(null)
    expect(parseDropZoneId('action:move')).toBe(null)
  })

  it('returns null when the raw id is neither a card id nor a known zone', () => {
    // Card ids carry a `|` separator; bare ids match neither prefix.
    expect(parseDropZoneId('j-uuid-123')).toBe(null)
    expect(parseDropZoneId('collection:page-7|j-uuid-123')).toBe(null)
    expect(parseDropZoneId('unsectioned|j-uuid-123')).toBe(null)
  })
})

describe('encodeCardId / parseCardId', () => {
  it('round-trips a card in a collection', () => {
    const encoded = encodeCardId({
      zone: { kind: 'collection', id: 'page-7' },
      journeyId: 'j1'
    })
    expect(encoded).toBe('collection:page-7|j1')
    expect(parseCardId(encoded)).toEqual({
      zone: { kind: 'collection', id: 'page-7' },
      journeyId: 'j1'
    })
  })

  it('round-trips a card in the unsectioned pool', () => {
    const encoded = encodeCardId({
      zone: { kind: 'unsectioned' },
      journeyId: 'j1'
    })
    expect(encoded).toBe('unsectioned|j1')
    expect(parseCardId(encoded)).toEqual({
      zone: { kind: 'unsectioned' },
      journeyId: 'j1'
    })
  })

  it('gives the same journey a distinct id per collection', () => {
    const inA = encodeCardId({
      zone: { kind: 'collection', id: 'A' },
      journeyId: 'j1'
    })
    const inB = encodeCardId({
      zone: { kind: 'collection', id: 'B' },
      journeyId: 'j1'
    })
    expect(inA).not.toBe(inB)
    expect(parseCardId(inA)?.journeyId).toBe('j1')
    expect(parseCardId(inB)?.journeyId).toBe('j1')
  })

  it('returns null for zone ids and malformed card ids', () => {
    expect(parseCardId('collection:page-7')).toBe(null)
    expect(parseCardId('unsectioned')).toBe(null)
    expect(parseCardId('action:move:page-7|j1')).toBe(null)
    expect(parseCardId('collection:page-7|')).toBe(null)
    expect(parseCardId('nonsense|j1')).toBe(null)
  })
})

describe('resolveSectionDrop', () => {
  const collision = (id: string): Collision => ({ id })
  const collectionX = encodeDropZoneId({ kind: 'collection', id: 'X' })
  const collectionY = encodeDropZoneId({ kind: 'collection', id: 'Y' })
  const unsectioned = encodeDropZoneId({ kind: 'unsectioned' })
  const moveIntoX = encodeDropZoneId({
    kind: 'action',
    collectionId: 'X',
    action: 'move'
  })
  const cardInX = encodeCardId({
    zone: { kind: 'collection', id: 'X' },
    journeyId: 'j-in-x'
  })
  const fromY = parseCardId(
    encodeCardId({ zone: { kind: 'collection', id: 'Y' }, journeyId: 'j-src' })
  )
  const fromPool = parseCardId(
    encodeCardId({ zone: { kind: 'unsectioned' }, journeyId: 'j-pool' })
  )
  const fromX = parseCardId(cardInX)

  it('passes through when no section is under the cursor', () => {
    const collisions = [collision('unsectioned|jA'), collision(cardInX)]
    expect(resolveSectionDrop(collisions, fromY)).toEqual({
      kind: 'passthrough'
    })
  })

  it('targets the action box over the section it floats on', () => {
    const collisions = [
      collision(cardInX),
      collision(moveIntoX),
      collision(collectionX)
    ]
    expect(resolveSectionDrop(collisions, fromY)).toEqual({
      kind: 'action',
      collision: collision(moveIntoX)
    })
  })

  it('targets the collection when moving in from the unsectioned pool', () => {
    const collisions = [collision(cardInX), collision(collectionX)]
    expect(resolveSectionDrop(collisions, fromPool)).toEqual({
      kind: 'section',
      collision: collision(collectionX)
    })
  })

  it('targets the collection when moving in from a different collection', () => {
    const collisions = [collision(cardInX), collision(collectionX)]
    expect(resolveSectionDrop(collisions, fromY)).toEqual({
      kind: 'section',
      collision: collision(collectionX)
    })
  })

  it('reorders when the dragged card belongs to the collection under the cursor', () => {
    const collisions = [collision(cardInX), collision(collectionX)]
    expect(resolveSectionDrop(collisions, fromX)).toEqual({
      kind: 'reorder',
      collectionId: 'X'
    })
  })

  it('targets the unsectioned pool when dragging out of a collection', () => {
    const collisions = [collision('unsectioned|jA'), collision(unsectioned)]
    expect(resolveSectionDrop(collisions, fromY)).toEqual({
      kind: 'section',
      collision: collision(unsectioned)
    })
  })

  it('uses the first section under the cursor when several overlap', () => {
    const collisions = [collision(collectionY), collision(collectionX)]
    expect(resolveSectionDrop(collisions, fromPool)).toEqual({
      kind: 'section',
      collision: collision(collectionY)
    })
  })

  it('never reorders when the active id is not a card', () => {
    const collisions = [collision(cardInX), collision(collectionX)]
    expect(resolveSectionDrop(collisions, null)).toEqual({
      kind: 'section',
      collision: collision(collectionX)
    })
  })
})
