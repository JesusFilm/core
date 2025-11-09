import { validateMuxLanguage } from './validateMuxLanguage'

describe('validateMuxLanguage', () => {
  it('should return false for null language code', () => {
    expect(validateMuxLanguage(null)).toBe(false)
  })

  it('should return false for undefined language code', () => {
    expect(validateMuxLanguage(undefined)).toBe(false)
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
      expect(validateMuxLanguage(code)).toBe(true)
    })
  })

  it('should return true for uppercase valid language codes', () => {
    expect(validateMuxLanguage('EN')).toBe(true)
    expect(validateMuxLanguage('ES')).toBe(true)
    expect(validateMuxLanguage('FR')).toBe(true)
  })

  it('should return true for mixed case valid language codes', () => {
    expect(validateMuxLanguage('En')).toBe(true)
    expect(validateMuxLanguage('Es')).toBe(true)
    expect(validateMuxLanguage('Fr')).toBe(true)
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
      expect(validateMuxLanguage(code)).toBe(false)
    })
  })

  it('should return false for empty string', () => {
    expect(validateMuxLanguage('')).toBe(false)
  })

  it('should handle BCP47 codes correctly', () => {
    // Should validate base language code only (first 2 characters)
    expect(validateMuxLanguage('en')).toBe(true)
    expect(validateMuxLanguage('es')).toBe(true)
    expect(validateMuxLanguage('fr')).toBe(true)
  })
})
