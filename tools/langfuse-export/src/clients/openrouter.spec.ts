import { parseThemes, parseTranslations } from './openrouter'

const validIds = new Set(['a', 'b', 'c'])

describe('parseThemes', () => {
  it('parses fenced JSON and filters to valid sessionIds', () => {
    const text =
      '```json\n{"themes":[{"label":"Salvation","sessionIds":["a","b"]}]}\n```'
    expect(parseThemes(text, validIds)).toEqual({
      themes: [{ label: 'Salvation', sessionIds: ['a', 'b'] }]
    })
  })

  it('parses bare (unfenced) JSON with surrounding prose', () => {
    const text =
      'Here are the themes: {"themes":[{"label":"Doubt","sessionIds":["c"]}]} done.'
    expect(parseThemes(text, validIds)).toEqual({
      themes: [{ label: 'Doubt', sessionIds: ['c'] }]
    })
  })

  it('drops hallucinated sessionIds not present in validIds', () => {
    const text = '{"themes":[{"label":"X","sessionIds":["a","ghost","z"]}]}'
    expect(parseThemes(text, validIds)).toEqual({
      themes: [{ label: 'X', sessionIds: ['a'] }]
    })
  })

  it('deduplicates repeated sessionIds within a theme', () => {
    const text = '{"themes":[{"label":"Grace","sessionIds":["a","a","b"]}]}'
    expect(parseThemes(text, validIds)).toEqual({
      themes: [{ label: 'Grace', sessionIds: ['a', 'b'] }]
    })
  })

  it('trims labels and filters whitespace-only ones', () => {
    const text = '{"themes":[{"label":"   ","sessionIds":["a"]}]}'
    expect(parseThemes(text, validIds)).toEqual({ themes: [] })
  })

  it('filters out themes with no label or no surviving sessionIds', () => {
    const text =
      '{"themes":[{"label":"","sessionIds":["a"]},{"label":"Y","sessionIds":["ghost"]},{"label":"Z","sessionIds":["b"]}]}'
    expect(parseThemes(text, validIds)).toEqual({
      themes: [{ label: 'Z', sessionIds: ['b'] }]
    })
  })

  it('throws when no JSON object is present', () => {
    expect(() => parseThemes('I cannot help with that.', validIds)).toThrow(
      /no JSON object/
    )
  })

  it('throws when the themes array is missing', () => {
    expect(() => parseThemes('{"groups":[]}', validIds)).toThrow(
      /missing themes/
    )
  })
})

describe('parseTranslations', () => {
  it('parses fenced JSON, lowercases lang, keeps the translation', () => {
    const text =
      '```json\n{"items":[{"id":"a","lang":"BN","en":"Did the resurrection happen?"}]}\n```'
    expect(parseTranslations(text, validIds)).toEqual(
      new Map([
        ['a', { sourceLanguage: 'bn', english: 'Did the resurrection happen?' }]
      ])
    )
  })

  it('parses bare JSON with surrounding prose', () => {
    const text =
      'Here you go: {"items":[{"id":"b","lang":"es","en":"Hello"}]} done.'
    expect(parseTranslations(text, validIds)).toEqual(
      new Map([['b', { sourceLanguage: 'es', english: 'Hello' }]])
    )
  })

  it('drops ids not in validIds', () => {
    const text = '{"items":[{"id":"ghost","lang":"fr","en":"salut"}]}'
    expect(parseTranslations(text, validIds).size).toBe(0)
  })

  it('drops entries with a missing or empty lang', () => {
    const text =
      '{"items":[{"id":"a","en":"x"},{"id":"b","lang":"   ","en":"y"}]}'
    expect(parseTranslations(text, validIds).size).toBe(0)
  })

  it('treats lang "en" as no translation, dropping any en the model supplied', () => {
    const text = '{"items":[{"id":"a","lang":"EN","en":"should be ignored"}]}'
    expect(parseTranslations(text, validIds)).toEqual(
      new Map([['a', { sourceLanguage: 'en' }]])
    )
  })

  it('drops non-en entries whose en is missing or empty (no fabricated claim)', () => {
    const text =
      '{"items":[{"id":"a","lang":"bn"},{"id":"b","lang":"ar","en":"   "}]}'
    expect(parseTranslations(text, validIds).size).toBe(0)
  })

  it('trims the english translation', () => {
    const text = '{"items":[{"id":"c","lang":"de","en":"  Grace  "}]}'
    expect(parseTranslations(text, validIds).get('c')).toEqual({
      sourceLanguage: 'de',
      english: 'Grace'
    })
  })

  it('throws when no JSON object is present', () => {
    expect(() => parseTranslations('I cannot help.', validIds)).toThrow(
      /no JSON object/
    )
  })

  it('throws when the items array is missing', () => {
    expect(() => parseTranslations('{"results":[]}', validIds)).toThrow(
      /missing items/
    )
  })
})
