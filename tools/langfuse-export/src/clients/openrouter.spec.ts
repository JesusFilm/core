import { batchByCharBudget, parseThemes, parseTranslations } from './openrouter'

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

  it('folds a full-name lang onto its code so facets cannot split', () => {
    const text =
      '{"items":[{"id":"a","lang":"Bengali","en":"Did the resurrection happen?"},{"id":"b","lang":"bn","en":"Who is Jesus?"}]}'
    const result = parseTranslations(text, validIds)
    // Both rows resolve to the same code — one language, one facet row.
    expect(result.get('a')?.sourceLanguage).toBe('bn')
    expect(result.get('b')?.sourceLanguage).toBe('bn')
  })

  it('treats a full-name "english" answer as no translation', () => {
    const text = '{"items":[{"id":"a","lang":"English","en":"ignored"}]}'
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

describe('batchByCharBudget', () => {
  const item = (id: string, chars: number): { id: string; text: string } => ({
    id,
    text: 'x'.repeat(chars)
  })

  it('returns no batches for no items', () => {
    expect(batchByCharBudget([])).toEqual([])
  })

  it('keeps items under the char budget in a single batch', () => {
    const items = [item('a', 100), item('b', 200), item('c', 300)]
    const batches = batchByCharBudget(items)
    expect(batches).toHaveLength(1)
    expect(batches[0].map((i) => i.id)).toEqual(['a', 'b', 'c'])
  })

  it('splits once the 6000-char budget would be exceeded', () => {
    // 3500 + 3500 > 6000, so the second item opens a new batch.
    const batches = batchByCharBudget([item('a', 3500), item('b', 3500)])
    expect(batches.map((b) => b.map((i) => i.id))).toEqual([['a'], ['b']])
  })

  it('caps a batch at 30 items even when every item is tiny', () => {
    const items = Array.from({ length: 65 }, (_, n) => item(`i${n}`, 1))
    const sizes = batchByCharBudget(items).map((b) => b.length)
    expect(sizes).toEqual([30, 30, 5])
  })

  it('sends a single over-budget item whole in its own batch', () => {
    const huge = item('big', 9000)
    const batches = batchByCharBudget([item('a', 100), huge, item('b', 100)])
    // The oversize item is isolated and never truncated.
    expect(batches.map((b) => b.map((i) => i.id))).toEqual([
      ['a'],
      ['big'],
      ['b']
    ])
    const bigBatch = batches.find((b) => b[0]?.id === 'big')
    expect(bigBatch?.[0].text).toHaveLength(9000)
  })
})
