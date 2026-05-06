import { encodeDropZoneId, parseDropZoneId } from './Droppables'

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

  it('coerces numeric raw ids to a string before parsing', () => {
    expect(parseDropZoneId(42)).toBe(null)
  })
})
