import { parseTranslations, toTranslatedValues } from './translatedValue'

describe('parseTranslations', () => {
  it('returns a copy of a translations object', () => {
    const json = { '496': { value: 'Bonjour', source: 'human' } }
    const parsed = parseTranslations(json)
    expect(parsed).toEqual(json)
    expect(parsed).not.toBe(json)
  })

  it('reads a malformed JSON value as no translations', () => {
    expect(parseTranslations('{"496":')).toEqual({})
    expect(parseTranslations([{ value: 'Bonjour', source: 'human' }])).toEqual(
      {}
    )
  })

  it('reads a non-object as no translations', () => {
    expect(parseTranslations(null)).toEqual({})
    expect(parseTranslations(undefined)).toEqual({})
    expect(parseTranslations(42)).toEqual({})
    expect(parseTranslations(true)).toEqual({})
  })
})

describe('toTranslatedValues', () => {
  it('lists each entry with a string value, defaulting the source to human', () => {
    expect(
      toTranslatedValues({
        '496': { value: 'Bonjour', source: 'machine' },
        '21028': { value: 'Hola' },
        '1106': { source: 'human' }
      })
    ).toEqual([
      { languageId: '496', value: 'Bonjour', source: 'machine' },
      { languageId: '21028', value: 'Hola', source: 'human' }
    ])
  })

  it('lists nothing for a non-object', () => {
    expect(toTranslatedValues('not json')).toEqual([])
  })
})
