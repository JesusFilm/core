import {
  extractWessRowArray,
  normalizeWessCountryRow
} from './wess-countries-import'

describe('extractWessRowArray', () => {
  const row = { id: 'US', name: 'United States' }

  it('returns a top-level object array as row objects', () => {
    expect(extractWessRowArray([row])).toEqual([row])
  })

  it('unwraps { data: [...] }', () => {
    expect(extractWessRowArray({ data: [row] })).toEqual([row])
  })

  it('unwraps stringified JSON array', () => {
    expect(extractWessRowArray(JSON.stringify([row]))).toEqual([row])
  })

  it('converts tabular [header, ...data] to objects', () => {
    expect(
      extractWessRowArray([
        ['id', 'name'],
        ['US', 'United States']
      ])
    ).toEqual([{ id: 'US', name: 'United States' }])
  })

  it('treats a single object with a country code as one row', () => {
    expect(
      extractWessRowArray({ COUNTRY_CODE: 'US', COUNTRY_NAME: 'United States' })
    ).toEqual([{ COUNTRY_CODE: 'US', COUNTRY_NAME: 'United States' }])
  })

  it('throws on unsupported object shapes', () => {
    expect(() => extractWessRowArray({ foo: 1, bar: 2 })).toThrow(
      'Unexpected WESS response: unsupported object shape'
    )
  })
})

describe('normalizeWessCountryRow', () => {
  it('maps WESS COUNTRY_CODE / COUNTRY_NAME / COUNTRY_POPULATION fields', () => {
    const normalized = normalizeWessCountryRow({
      COUNTRY_CODE: 'us',
      COUNTRY_NAME: 'United States',
      COUNTRY_POPULATION: 331000000
    })
    expect(normalized).toEqual({
      id: 'US',
      name: 'United States',
      population: 331000000
    })
  })

  it('uppercases the country id', () => {
    expect(normalizeWessCountryRow({ id: 'fr' })?.id).toBe('FR')
  })

  it('parses numeric population strings to numbers', () => {
    const normalized = normalizeWessCountryRow({
      id: 'CA',
      COUNTRY_POPULATION: '38000000'
    })
    expect(normalized?.population).toBe(38000000)
  })

  it('returns null when id is missing', () => {
    expect(normalizeWessCountryRow({ COUNTRY_NAME: 'x' })).toBeNull()
  })

  it('returns null population when it cannot be parsed', () => {
    const normalized = normalizeWessCountryRow({
      id: 'XX',
      COUNTRY_POPULATION: 'n/a'
    })
    expect(normalized?.population).toBeNull()
  })
})
