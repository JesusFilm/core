import { getLanguageIdFromLocale } from './getLanguageIdFromLocale'

describe('getLanguageIdFromLocale', () => {
  describe('valid locale mappings', () => {
    it('returns correct language ID for English locale', () => {
      expect(getLanguageIdFromLocale('en')).toBe('529')
    })

    it('returns correct language ID for Spanish locale', () => {
      expect(getLanguageIdFromLocale('es')).toBe('21028')
    })

    it('returns correct language ID for French locale', () => {
      expect(getLanguageIdFromLocale('fr')).toBe('496')
    })

    it('returns correct language ID for Indonesian locale', () => {
      expect(getLanguageIdFromLocale('id')).toBe('16639')
    })

    it('returns correct language ID for Thai locale', () => {
      expect(getLanguageIdFromLocale('th')).toBe('13169')
    })

    it('returns correct language ID for Japanese locale', () => {
      expect(getLanguageIdFromLocale('ja')).toBe('7083')
    })

    it('returns correct language ID for Korean locale', () => {
      expect(getLanguageIdFromLocale('ko')).toBe('3804')
    })

    it('returns correct language ID for Russian locale', () => {
      expect(getLanguageIdFromLocale('ru')).toBe('3934')
    })

    it('returns correct language ID for Turkish locale', () => {
      expect(getLanguageIdFromLocale('tr')).toBe('1942')
    })

    it('returns correct language ID for Traditional Chinese locale', () => {
      expect(getLanguageIdFromLocale('zh')).toBe('20615')
    })

    it('returns correct language ID for Simplified Chinese locale', () => {
      expect(getLanguageIdFromLocale('zh-Hans-CN')).toBe('21754')
    })
  })

  describe('fallback behavior', () => {
    it('returns English language ID for undefined locale', () => {
      expect(getLanguageIdFromLocale(undefined)).toBe('529')
    })

    it('returns English language ID for null locale', () => {
      expect(getLanguageIdFromLocale(null)).toBe('529')
    })

    it('returns English language ID for empty string locale', () => {
      expect(getLanguageIdFromLocale('')).toBe('529')
    })

    it('returns English language ID for unsupported locale', () => {
      expect(getLanguageIdFromLocale('xx')).toBe('529')
    })

    it('returns English language ID for non-existent locale', () => {
      expect(getLanguageIdFromLocale('nonexistent')).toBe('529')
    })
  })

  describe('edge cases', () => {
    it('handles case-sensitive locale matching', () => {
      expect(getLanguageIdFromLocale('EN')).toBe('529') // Should still work due to case-insensitive matching
      expect(getLanguageIdFromLocale('Es')).toBe('529') // Should fallback for incorrect case
    })

    it('handles locale with region code', () => {
      expect(getLanguageIdFromLocale('en-US')).toBe('529') // Should fallback to English
      expect(getLanguageIdFromLocale('zh-CN')).toBe('529') // Should fallback to English
    })
  })
})
