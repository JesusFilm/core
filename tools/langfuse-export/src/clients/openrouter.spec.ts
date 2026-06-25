import { parseThemes } from './openrouter'

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
