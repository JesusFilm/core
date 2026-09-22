import {
  dedupeByMaxSpeakers,
  extractWessRowArray,
  normalizeWessCountryLanguageRow,
  shouldUpdateSpeakers
} from './wess-country-languages-import'

describe('extractWessRowArray', () => {
  const row = { LAN_NO: 529, GEO_NO: 62, SPEAKERS: 250000000 }

  it('returns a top-level object array as row objects', () => {
    expect(extractWessRowArray([row])).toEqual([row])
  })

  it('unwraps { data: [...] }', () => {
    expect(extractWessRowArray({ data: [row] })).toEqual([row])
  })

  it('converts tabular [header, ...data] to objects', () => {
    expect(
      extractWessRowArray([
        ['LAN_NO', 'GEO_NO', 'SPEAKERS'],
        ['529', '62', '250000000']
      ])
    ).toEqual([{ LAN_NO: '529', GEO_NO: '62', SPEAKERS: '250000000' }])
  })

  it('treats a single object with both LAN_NO and GEO_NO as one row', () => {
    expect(extractWessRowArray({ LAN_NO: 529, GEO_NO: 62 })).toEqual([
      { LAN_NO: 529, GEO_NO: 62 }
    ])
  })

  it('throws on unsupported object shapes', () => {
    expect(() => extractWessRowArray({ foo: 1, bar: 2 })).toThrow(
      'Unexpected WESS response: unsupported object shape'
    )
  })

  it('throws when only LAN_NO is present (no GEO_NO)', () => {
    expect(() => extractWessRowArray({ LAN_NO: 529 })).toThrow(
      'Unexpected WESS response: unsupported object shape'
    )
  })
})

describe('normalizeWessCountryLanguageRow', () => {
  it('maps WESS LAN_NO / GEO_NO / SPEAKERS fields', () => {
    const normalized = normalizeWessCountryLanguageRow({
      COUNTRY: 'Afghanistan',
      GEO_NO: 62,
      LAN_NAME: 'AFGHAN SIGN LANGUAGE',
      LAN_NO: 139304,
      SPEAKERS: 190000
    })
    expect(normalized).toEqual({
      languageId: '139304',
      geoNo: 62,
      speakers: 190000
    })
  })

  it('defaults speakers to 0 when missing', () => {
    const normalized = normalizeWessCountryLanguageRow({
      LAN_NO: '1',
      GEO_NO: 99
    })
    expect(normalized).toEqual({ languageId: '1', geoNo: 99, speakers: 0 })
  })

  it('returns null when languageId is missing', () => {
    expect(normalizeWessCountryLanguageRow({ GEO_NO: 62 })).toBeNull()
  })

  it('returns null when GEO_NO is missing', () => {
    expect(normalizeWessCountryLanguageRow({ LAN_NO: 529 })).toBeNull()
  })
})

describe('shouldUpdateSpeakers', () => {
  it('preserves the 999_999_999 sort sentinel', () => {
    expect(shouldUpdateSpeakers(999_999_999, 1_000)).toBe(false)
  })

  it('preserves lower-tier sentinels (888, 777, 555, 444)', () => {
    expect(shouldUpdateSpeakers(888_888_888, 1_000)).toBe(false)
    expect(shouldUpdateSpeakers(777_777_777, 1_000)).toBe(false)
    expect(shouldUpdateSpeakers(555_555_555, 1_000)).toBe(false)
    expect(shouldUpdateSpeakers(444_444_444, 1_000)).toBe(false)
  })

  it('preserves any value at or above the 400M sentinel threshold', () => {
    expect(shouldUpdateSpeakers(400_000_000, 100)).toBe(false)
    expect(shouldUpdateSpeakers(840_000_000, 100)).toBe(false)
  })

  it('updates legitimate per-country values (just under 400M)', () => {
    expect(shouldUpdateSpeakers(339_000_000, 340_000_000)).toBe(true)
  })

  it('refuses to wipe a real value with WESS 0', () => {
    expect(shouldUpdateSpeakers(1_310_000, 0)).toBe(false)
    expect(shouldUpdateSpeakers(1, 0)).toBe(false)
  })

  it('allows 0 → real updates', () => {
    expect(shouldUpdateSpeakers(0, 50_000)).toBe(true)
  })

  it('allows 0 → 0 to be treated as unchanged (returns false)', () => {
    expect(shouldUpdateSpeakers(0, 0)).toBe(false)
  })

  it('returns false when values match (no update needed)', () => {
    expect(shouldUpdateSpeakers(50_000, 50_000)).toBe(false)
  })

  it('returns true for normal differing positive values', () => {
    expect(shouldUpdateSpeakers(1_000, 2_000)).toBe(true)
    expect(shouldUpdateSpeakers(50_000, 30_000)).toBe(true)
  })
})

describe('dedupeByMaxSpeakers', () => {
  it('collapses duplicate (languageId, geoNo) keys keeping the max speakers', () => {
    const input = [
      { languageId: '494', geoNo: 212, speakers: 6_565_000 },
      { languageId: '494', geoNo: 212, speakers: 6_770_000 },
      { languageId: '139091', geoNo: 212, speakers: 1_400_000 },
      { languageId: '139091', geoNo: 212, speakers: 2_570_000 }
    ]
    expect(dedupeByMaxSpeakers(input)).toEqual([
      { languageId: '494', geoNo: 212, speakers: 6_770_000 },
      { languageId: '139091', geoNo: 212, speakers: 2_570_000 }
    ])
  })

  it('is order-independent (gives the same MAX regardless of input order)', () => {
    const a = [
      { languageId: '1', geoNo: 1, speakers: 100 },
      { languageId: '1', geoNo: 1, speakers: 500 },
      { languageId: '1', geoNo: 1, speakers: 250 }
    ]
    const b = [...a].reverse()
    expect(dedupeByMaxSpeakers(a)[0].speakers).toBe(500)
    expect(dedupeByMaxSpeakers(b)[0].speakers).toBe(500)
  })

  it('treats different geoNo or languageId as separate keys', () => {
    const input = [
      { languageId: '1', geoNo: 1, speakers: 100 },
      { languageId: '1', geoNo: 2, speakers: 200 },
      { languageId: '2', geoNo: 1, speakers: 300 }
    ]
    expect(dedupeByMaxSpeakers(input)).toHaveLength(3)
  })

  it('returns the input as-is when there are no duplicates', () => {
    const input = [
      { languageId: '1', geoNo: 1, speakers: 100 },
      { languageId: '2', geoNo: 2, speakers: 200 }
    ]
    expect(dedupeByMaxSpeakers(input)).toEqual(input)
  })
})
