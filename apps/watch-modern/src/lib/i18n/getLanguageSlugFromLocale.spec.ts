import { getLanguageSlugFromLocale } from './getLanguageSlugFromLocale'

describe('getLanguageSlugFromLocale', () => {
  describe('valid locale mappings', () => {
    it('returns correct language slug for English locale', () => {
      expect(getLanguageSlugFromLocale('en')).toBe('english.html')
    })

    it('returns correct language slug for Spanish locale', () => {
      expect(getLanguageSlugFromLocale('es')).toBe('spanish-latin-american.html')
    })

    it('returns correct language slug for French locale', () => {
      expect(getLanguageSlugFromLocale('fr')).toBe('french.html')
    })

    it('returns correct language slug for Indonesian locale', () => {
      expect(getLanguageSlugFromLocale('id')).toBe('indonesian-yesus.html')
    })

    it('returns correct language slug for Thai locale', () => {
      expect(getLanguageSlugFromLocale('th')).toBe('thai.html')
    })

    it('returns correct language slug for Japanese locale', () => {
      expect(getLanguageSlugFromLocale('ja')).toBe('japanese.html')
    })

    it('returns correct language slug for Korean locale', () => {
      expect(getLanguageSlugFromLocale('ko')).toBe('korean.html')
    })

    it('returns correct language slug for Russian locale', () => {
      expect(getLanguageSlugFromLocale('ru')).toBe('russian.html')
    })

    it('returns correct language slug for Turkish locale', () => {
      expect(getLanguageSlugFromLocale('tr')).toBe('turkish.html')
    })

    it('returns correct language slug for Traditional Chinese locale', () => {
      expect(getLanguageSlugFromLocale('zh')).toBe('chinese-mandarin.html')
    })

    it('returns correct language slug for Simplified Chinese locale', () => {
      expect(getLanguageSlugFromLocale('zh-Hans-CN')).toBe('chinese-simplified.html')
    })
  })

  describe('fallback behavior', () => {
    it('returns English language slug for undefined locale', () => {
      expect(getLanguageSlugFromLocale(undefined)).toBe('english.html')
    })

    it('returns English language slug for null locale', () => {
      expect(getLanguageSlugFromLocale(null)).toBe('english.html')
    })

    it('returns English language slug for empty string locale', () => {
      expect(getLanguageSlugFromLocale('')).toBe('english.html')
    })

    it('returns English language slug for unsupported locale', () => {
      expect(getLanguageSlugFromLocale('xx')).toBe('english.html')
    })

    it('returns English language slug for non-existent locale', () => {
      expect(getLanguageSlugFromLocale('nonexistent')).toBe('english.html')
    })
  })

  describe('edge cases', () => {
    it('handles case-sensitive locale matching', () => {
      expect(getLanguageSlugFromLocale('EN')).toBe('english.html') // Should still work due to case-insensitive matching
      expect(getLanguageSlugFromLocale('Es')).toBe('english.html') // Should fallback for incorrect case
    })

    it('handles locale with region code', () => {
      expect(getLanguageSlugFromLocale('en-US')).toBe('english.html') // Should fallback to English
      expect(getLanguageSlugFromLocale('zh-CN')).toBe('english.html') // Should fallback to English
    })
  })

  describe('language slug prioritization', () => {
    it('returns first language slug for locales with multiple options', () => {
      // Spanish has multiple language slugs, should return the first one
      expect(getLanguageSlugFromLocale('es')).toBe('spanish-latin-american.html')

      // French has multiple language slugs, should return the first one
      expect(getLanguageSlugFromLocale('fr')).toBe('french.html')

      // Korean has multiple language slugs, should return the first one
      expect(getLanguageSlugFromLocale('ko')).toBe('korean.html')

      // Russian has multiple language slugs, should return the first one
      expect(getLanguageSlugFromLocale('ru')).toBe('russian.html')

      // Traditional Chinese has multiple language slugs, should return the first one
      expect(getLanguageSlugFromLocale('zh')).toBe('chinese-mandarin.html')
    })
  })
})
