import { readFileSync } from 'fs'
import { resolve } from 'path'

import {
  COUNTRY_NUMERIC_CODES,
  countryAlpha2,
  countryNumericCode
} from './countryNumericCode'

interface AtlasShape {
  id?: string
  properties: { name: string }
}

const atlas = JSON.parse(
  readFileSync(
    resolve(
      __dirname,
      '../../../../../../../../apps/journeys/public/countries-110m.json'
    ),
    'utf8'
  )
) as { objects: { countries: { geometries: AtlasShape[] } } }

describe('countryNumericCode', () => {
  it('has the 249 officially assigned codes, each with its own numeric id', () => {
    const numerics = Object.values(COUNTRY_NUMERIC_CODES)
    expect(Object.keys(COUNTRY_NUMERIC_CODES)).toHaveLength(249)
    expect(new Set(numerics).size).toBe(249)
    expect(numerics.every((numeric) => /^\d{3}$/.test(numeric))).toBe(true)
  })

  it('joins an alpha-2 code to the numeric id of its world-atlas shape', () => {
    expect(countryNumericCode('US')).toBe('840')
    expect(countryNumericCode('FR')).toBe('250')
    expect(countryNumericCode('AF')).toBe('004')
  })

  it('reads the code in any case', () => {
    expect(countryNumericCode('fr')).toBe('250')
  })

  it('returns nothing for the codes Plausible invents', () => {
    expect(countryNumericCode('XK')).toBeUndefined()
    expect(countryNumericCode('A1')).toBeUndefined()
    expect(countryNumericCode('T1')).toBeUndefined()
  })

  it('returns nothing for a microstate with no shape in the 110m atlas', () => {
    expect(countryNumericCode('SG')).toBe('702')
    const ids = new Set(atlas.objects.countries.geometries.map(({ id }) => id))
    expect(ids.has('702')).toBe(false)
  })

  it('maps a shape id back to its alpha-2 code', () => {
    expect(countryAlpha2('840')).toBe('US')
    expect(countryAlpha2('000')).toBeUndefined()
  })

  it('numbers every shape of the atlas but the three it leaves unnumbered', () => {
    const geometries = atlas.objects.countries.geometries
    const unnumbered = geometries.filter(({ id }) => id == null)
    expect(unnumbered.map(({ properties }) => properties.name).sort()).toEqual([
      'Kosovo',
      'N. Cyprus',
      'Somaliland'
    ])
    const unknown = geometries.filter(
      ({ id }) => id != null && countryAlpha2(id) == null
    )
    expect(unknown).toEqual([])
  })
})
