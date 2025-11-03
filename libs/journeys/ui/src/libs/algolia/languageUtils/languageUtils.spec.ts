import {
  capitalizeFirstLetter,
  normalizeLanguage,
  parseSuggestion,
  stripLanguageFromQuery
} from './languageUtils'

describe('normalizeLanguage', () => {
  it('should normalise empty language name', () => {
    expect(normalizeLanguage('')).toBe('')
  })

  it('should normalise french language name', () => {
    expect(normalizeLanguage('French')).toBe('french')
  })

  it('should normalise spanish language name', () => {
    expect(normalizeLanguage('Spanish, Latin American')).toBe('spanish')
  })

  it('should normalise quecha language name', () => {
    expect(
      normalizeLanguage('Quechua, Huanuco, Huamalies-Northern Dos De Mayo')
    ).toBe('quechua')
  })
})

describe('capitalizeFirstLetter', () => {
  it('should return empty string', () => {
    expect(capitalizeFirstLetter('')).toBe('')
  })

  it('should capitalise french language name', () => {
    expect(capitalizeFirstLetter('french')).toBe('French')
  })

  it('should capitalize spanish language name', () => {
    expect(capitalizeFirstLetter('spanish, latin american')).toBe(
      'Spanish, latin american'
    )
  })
})

describe('parseSuggestion', () => {
  it('should return empty string', () => {
    expect(parseSuggestion('')).toEqual([''])
  })

  it('should return non empty string', () => {
    expect(parseSuggestion('test')).toEqual(['test'])
  })

  it('should parse query separate from a category with in', () => {
    expect(parseSuggestion('query in english')).toEqual(['query', 'english'])
  })

  it('should parse categories separate', () => {
    expect(parseSuggestion('french and english')).toEqual(['french', 'english'])
  })
})

describe('stripLanguageFromQuery', () => {
  it('should return empty string from empty string', () => {
    expect(stripLanguageFromQuery('', '')).toBe('')
  })

  it('should return empty language from jesus string', () => {
    expect(stripLanguageFromQuery('', 'jesus')).toBe('jesus')
  })

  it('should return empty string because no french found', () => {
    expect(stripLanguageFromQuery('French', '')).toBe('')
  })

  it('should return empty string because no spanish found in love spain', () => {
    expect(stripLanguageFromQuery('Spanish', 'love spain')).toBe('love spain')
  })

  it('should strip irish from sport irish query', () => {
    expect(stripLanguageFromQuery('Irish', 'sport irish')).toBe('sport')
  })

  it('should strip spanish from jesus spanish', () => {
    expect(
      stripLanguageFromQuery('Spanish, Latin American', 'jesus spanish')
    ).toBe('jesus')
  })
})
