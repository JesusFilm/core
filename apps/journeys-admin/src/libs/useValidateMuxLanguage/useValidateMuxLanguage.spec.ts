import { useValidateMuxLanguage } from './useValidateMuxLanguage'

describe('useValidateMuxLanguage', () => {
  it('should return false for null language code', () => {
    expect(useValidateMuxLanguage(null)).toBe(false)
  })

  it('should return false for undefined language code', () => {
    expect(useValidateMuxLanguage(undefined)).toBe(false)
  })

  it('should return true for valid Mux language codes', () => {
    const validCodes = [
      'en',
      'es',
      'it',
      'pt',
      'de',
      'fr',
      'pl',
      'ru',
      'nl',
      'ca',
      'tr',
      'sv',
      'uk',
      'no',
      'fi',
      'sk',
      'el',
      'cs',
      'hr',
      'da',
      'ro',
      'bg'
    ]

    validCodes.forEach((code) => {
      expect(useValidateMuxLanguage(code)).toBe(true)
    })
  })

  it('should return true for uppercase valid language codes', () => {
    expect(useValidateMuxLanguage('EN')).toBe(true)
    expect(useValidateMuxLanguage('ES')).toBe(true)
    expect(useValidateMuxLanguage('FR')).toBe(true)
  })

  it('should return true for mixed case valid language codes', () => {
    expect(useValidateMuxLanguage('En')).toBe(true)
    expect(useValidateMuxLanguage('Es')).toBe(true)
    expect(useValidateMuxLanguage('Fr')).toBe(true)
  })

  it('should return false for invalid language codes', () => {
    const invalidCodes = [
      'xx', // Not supported
      'jp', // Japanese not supported
      'zh', // Chinese not supported
      'ar', // Arabic not supported
      'ko', // Korean not supported
      'invalid',
      '123',
      ''
    ]

    invalidCodes.forEach((code) => {
      expect(useValidateMuxLanguage(code)).toBe(false)
    })
  })

  it('should return false for empty string', () => {
    expect(useValidateMuxLanguage('')).toBe(false)
  })

  it('should handle BCP47 codes correctly', () => {
    // Should validate base language code only (first 2 characters)
    expect(useValidateMuxLanguage('en')).toBe(true)
    expect(useValidateMuxLanguage('es')).toBe(true)
    expect(useValidateMuxLanguage('fr')).toBe(true)
  })
})
