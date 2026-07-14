import {
  extractWessRowArray,
  normalizeLanguageSlugBase,
  normalizeWessLanguageRow
} from './wess-languages-import'

describe('extractWessRowArray', () => {
  const row = { id: '529', name: 'English' }

  it('returns a top-level object array as row objects', () => {
    expect(extractWessRowArray([row])).toEqual([row])
  })

  it('unwraps { data: [...] }', () => {
    expect(extractWessRowArray({ data: [row] })).toEqual([row])
  })

  it('unwraps { rows: [...] }', () => {
    expect(extractWessRowArray({ rows: [row] })).toEqual([row])
  })

  it('unwraps stringified JSON array', () => {
    expect(extractWessRowArray(JSON.stringify([row]))).toEqual([row])
  })

  it('converts tabular [header, ...data] to objects', () => {
    expect(
      extractWessRowArray([
        ['id', 'name'],
        ['529', 'English']
      ])
    ).toEqual([{ id: '529', name: 'English' }])
  })

  it('treats a single object with an id as one row', () => {
    expect(extractWessRowArray({ id: '1', name: 'A' })).toEqual([{ id: '1', name: 'A' }])
  })

  it('treats a single WESS row with LAN_NO as one row', () => {
    expect(extractWessRowArray({ LAN_NO: 185035, LAN_NAME: 'Wekais' })).toEqual([
      { LAN_NO: 185035, LAN_NAME: 'Wekais' }
    ])
  })

  it('throws on unsupported object shapes', () => {
    expect(() => extractWessRowArray({ foo: 1, bar: 2 })).toThrow(
      'Unexpected WESS response: unsupported object shape'
    )
  })
})

describe('normalizeLanguageSlugBase', () => {
  it('lowercases and turns spaces into hyphens', () => {
    expect(normalizeLanguageSlugBase('Albarradas Sign Language')).toBe(
      'albarradas-sign-language'
    )
  })

  it('turns commas and spaces into single hyphens and trims', () => {
    expect(normalizeLanguageSlugBase('  Foo ,  Bar  ')).toBe('foo-bar')
  })

  it('turns underscores and punctuation into hyphens', () => {
    expect(normalizeLanguageSlugBase('Sign_Language (draft)')).toBe(
      'sign-language-draft'
    )
  })

  it('returns empty string for blank input', () => {
    expect(normalizeLanguageSlugBase('   ')).toBe('')
  })
})

describe('normalizeWessLanguageRow', () => {
  it('maps WESS LAN_NO / LAN_NAME / ISO_CODE fields', () => {
    const normalized = normalizeWessLanguageRow({
      LAN_NO: 185035,
      LAN_NAME: 'Wekais',
      ISO_CODE: null,
      COUNTRY_CODE: 'TL'
    })
    expect(normalized).toEqual({
      id: '185035',
      name: 'Wekais',
      bcp47: null,
      iso3: null,
      slug: null,
      hasVideos: null
    })
  })

  it('prefers id over languageId when both exist', () => {
    const normalized = normalizeWessLanguageRow({
      languageId: 'L',
      id: 'I'
    })
    expect(normalized?.id).toBe('I')
  })

  it('lower-cases bcp47 and iso3', () => {
    const normalized = normalizeWessLanguageRow({
      id: '1',
      bcp47: 'EN-US',
      iso3: 'ENG'
    })
    expect(normalized?.bcp47).toBe('en-us')
    expect(normalized?.iso3).toBe('eng')
  })

  it('returns null when id is missing', () => {
    expect(normalizeWessLanguageRow({ name: 'x' })).toBeNull()
  })
})
