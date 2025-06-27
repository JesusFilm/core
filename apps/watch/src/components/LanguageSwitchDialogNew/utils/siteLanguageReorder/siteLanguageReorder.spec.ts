import { LanguageOption } from '@core/shared/ui/LanguageAutocomplete'

import { siteLanguageReorder } from './siteLanguageReorder'

// Mock data for testing
const mockLanguages: LanguageOption[] = [
  {
    id: 'en',
    localName: 'English',
    nativeName: 'English',
    slug: 'english'
  },
  {
    id: 'es',
    localName: 'Español',
    nativeName: 'Spanish',
    slug: 'spanish'
  },
  {
    id: 'fr',
    localName: 'Français',
    nativeName: 'French',
    slug: 'french'
  },
  {
    id: 'de',
    localName: 'Deutsch',
    nativeName: 'German',
    slug: 'german'
  },
  {
    id: 'ja',
    localName: '日本語',
    nativeName: 'Japanese',
    slug: 'japanese'
  }
]

const mockSiteLangEnglish: LanguageOption = {
  id: 'en',
  localName: 'English',
  nativeName: 'English',
  slug: 'english'
}

const mockSiteLangSpanish: LanguageOption = {
  id: 'es',
  localName: 'Español',
  nativeName: 'Spanish',
  slug: 'spanish'
}

describe('siteLanguageReorder', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic functionality', () => {
    it('should return languages without headers when no suggestions are made', () => {
      const result = siteLanguageReorder({
        languages: mockLanguages,
        siteLang: null,
        browserLanguage: undefined,
        country: undefined
      })

      // Should return all languages without any headers or dividers
      expect(result).toHaveLength(mockLanguages.length)
      expect(result.every((lang) => lang.type === 'language')).toBe(true)
      expect(result.find((lang) => lang.type === 'header')).toBeUndefined()
      expect(result.find((lang) => lang.type === 'divider')).toBeUndefined()
    })

    it('should handle empty languages array', () => {
      const result = siteLanguageReorder({
        languages: [],
        siteLang: mockSiteLangEnglish,
        browserLanguage: 'fr-FR',
        country: 'US'
      })

      // Should still add site language to suggested section even with empty languages array
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        id: '__header_suggested__',
        type: 'header'
      })
      expect(result[1]).toEqual({
        ...mockSiteLangEnglish,
        type: 'language'
      })
    })
  })

  describe('site language prioritization', () => {
    it('should add site language to suggested section', () => {
      const result = siteLanguageReorder({
        languages: mockLanguages,
        siteLang: mockSiteLangEnglish,
        browserLanguage: undefined,
        country: undefined
      })

      // Should have header, site language, divider, then remaining languages
      expect(result[0]).toEqual({
        id: '__header_suggested__',
        type: 'header'
      })
      expect(result[1]).toEqual({
        ...mockSiteLangEnglish,
        type: 'language'
      })
      expect(result[2]).toEqual({
        id: '__divider__',
        type: 'divider'
      })

      // Remaining languages should not include the site language
      const remainingLanguages = result.slice(3)
      expect(
        remainingLanguages.find((lang) => lang.id === 'en')
      ).toBeUndefined()
      expect(remainingLanguages).toHaveLength(mockLanguages.length - 1)
    })

    it('should handle site language not in languages array', () => {
      const nonExistentSiteLang: LanguageOption = {
        id: 'nonexistent',
        localName: 'Non-existent',
        nativeName: 'Non-existent',
        slug: 'nonexistent'
      }

      const result = siteLanguageReorder({
        languages: mockLanguages,
        siteLang: nonExistentSiteLang,
        browserLanguage: undefined,
        country: undefined
      })

      // Should still add the site language to suggested section
      expect(result[0].type).toBe('header')
      expect(result[1]).toEqual({
        ...nonExistentSiteLang,
        type: 'language'
      })
      expect(result[2].type).toBe('divider')

      // All original languages should still be present
      const remainingLanguages = result.slice(3)
      expect(remainingLanguages).toHaveLength(mockLanguages.length)
    })
  })

  describe('browser language detection', () => {
    it('should extract language code from browser language with country', () => {
      const result = siteLanguageReorder({
        languages: mockLanguages,
        siteLang: mockSiteLangEnglish,
        browserLanguage: 'fr-FR', // Should extract 'fr'
        country: undefined
      })

      // Should have English (site) and French (browser) in suggested section
      const suggestedLanguages = result.slice(1, 3) // Skip header, take next 2
      expect(suggestedLanguages[0].id).toBe('en') // Site language first
      expect(suggestedLanguages[1].id).toBe('fr') // Browser language second
    })

    it('should handle browser language without country code', () => {
      const result = siteLanguageReorder({
        languages: mockLanguages,
        siteLang: mockSiteLangEnglish,
        browserLanguage: 'es', // Already just language code
        country: undefined
      })

      const suggestedLanguages = result.slice(1, 3)
      expect(suggestedLanguages[0].id).toBe('en') // Site language
      expect(suggestedLanguages[1].id).toBe('es') // Browser language
    })

    it('should not duplicate browser language if it matches site language', () => {
      const result = siteLanguageReorder({
        languages: mockLanguages,
        siteLang: mockSiteLangEnglish,
        browserLanguage: 'en-US', // Same as site language
        country: undefined
      })

      // Should only have one English entry in suggested section
      const suggestedSection = result.slice(
        1,
        result.findIndex((lang) => lang.type === 'divider')
      )
      expect(suggestedSection).toHaveLength(1)
      expect(suggestedSection[0].id).toBe('en')
    })

    it('should handle browser language not in languages array', () => {
      const result = siteLanguageReorder({
        languages: mockLanguages,
        siteLang: mockSiteLangEnglish,
        browserLanguage: 'zh-CN', // Not in mockLanguages
        country: undefined
      })

      // Should only have site language in suggested section
      const suggestedSection = result.slice(
        1,
        result.findIndex((lang) => lang.type === 'divider')
      )
      expect(suggestedSection).toHaveLength(1)
      expect(suggestedSection[0].id).toBe('en')
    })
  })

  describe('country-based language suggestions', () => {
    it('should add country-based language to suggestions', () => {
      // Mock a country that maps to a specific language
      // Looking at LANGUAGE_MAPPINGS, 'ES' should map to Spanish
      const result = siteLanguageReorder({
        languages: mockLanguages,
        siteLang: mockSiteLangEnglish,
        browserLanguage: undefined,
        country: 'ES' // Spain - should suggest Spanish
      })

      const suggestedSection = result.slice(
        1,
        result.findIndex((lang) => lang.type === 'divider')
      )
      expect(suggestedSection).toHaveLength(2)
      expect(suggestedSection[0].id).toBe('en') // Site language
      expect(suggestedSection[1].id).toBe('es') // Country-based language
    })

    it('should not duplicate country language if it matches site language', () => {
      const result = siteLanguageReorder({
        languages: mockLanguages,
        siteLang: mockSiteLangSpanish,
        browserLanguage: undefined,
        country: 'ES' // Spain - maps to Spanish, same as site language
      })

      // Should only have one Spanish entry
      const suggestedSection = result.slice(
        1,
        result.findIndex((lang) => lang.type === 'divider')
      )
      expect(suggestedSection).toHaveLength(1)
      expect(suggestedSection[0].id).toBe('es')
    })

    it('should not duplicate country language if it matches browser language', () => {
      const result = siteLanguageReorder({
        languages: mockLanguages,
        siteLang: mockSiteLangEnglish,
        browserLanguage: 'es-MX', // Spanish browser language
        country: 'ES' // Spain - also maps to Spanish
      })

      // Should have English and Spanish only (no duplication)
      const suggestedSection = result.slice(
        1,
        result.findIndex((lang) => lang.type === 'divider')
      )
      expect(suggestedSection).toHaveLength(2)
      expect(suggestedSection[0].id).toBe('en') // Site language
      expect(suggestedSection[1].id).toBe('es') // Browser/country language (no duplicate)
    })

    it('should handle country not in LANGUAGE_MAPPINGS', () => {
      const result = siteLanguageReorder({
        languages: mockLanguages,
        siteLang: mockSiteLangEnglish,
        browserLanguage: undefined,
        country: 'XX' // Non-existent country
      })

      // Should only have site language
      const suggestedSection = result.slice(
        1,
        result.findIndex((lang) => lang.type === 'divider')
      )
      expect(suggestedSection).toHaveLength(1)
      expect(suggestedSection[0].id).toBe('en')
    })
  })

  describe('complex scenarios with multiple suggestions', () => {
    it('should handle all three suggestion types (site, browser, country) when all different', () => {
      const result = siteLanguageReorder({
        languages: mockLanguages,
        siteLang: mockSiteLangEnglish, // English
        browserLanguage: 'fr-FR', // French
        country: 'ES' // Spain -> Spanish
      })

      // Should have header, 3 suggested languages, divider, remaining languages
      expect(result[0].type).toBe('header')

      const suggestedSection = result.slice(
        1,
        result.findIndex((lang) => lang.type === 'divider')
      )
      expect(suggestedSection).toHaveLength(3)
      expect(suggestedSection[0].id).toBe('en') // Site language first
      expect(suggestedSection[1].id).toBe('fr') // Browser language second
      expect(suggestedSection[2].id).toBe('es') // Country language third

      expect(result.find((lang) => lang.type === 'divider')).toBeDefined()

      // Remaining languages should not include the suggested ones
      const remainingLanguages = result.slice(
        result.findIndex((lang) => lang.type === 'divider') + 1
      )
      expect(
        remainingLanguages.find((lang) => lang.id === 'en')
      ).toBeUndefined()
      expect(
        remainingLanguages.find((lang) => lang.id === 'fr')
      ).toBeUndefined()
      expect(
        remainingLanguages.find((lang) => lang.id === 'es')
      ).toBeUndefined()
    })

    it('should maintain proper order: site -> browser -> country', () => {
      const result = siteLanguageReorder({
        languages: mockLanguages,
        siteLang: mockSiteLangSpanish, // Spanish
        browserLanguage: 'en-US', // English
        country: 'FR' // France -> French
      })

      const suggestedSection = result.slice(
        1,
        result.findIndex((lang) => lang.type === 'divider')
      )
      expect(suggestedSection[0].id).toBe('es') // Site language first
      expect(suggestedSection[1].id).toBe('en') // Browser language second
      expect(suggestedSection[2].id).toBe('fr') // Country language third
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle null siteLang gracefully', () => {
      const result = siteLanguageReorder({
        languages: mockLanguages,
        siteLang: null,
        browserLanguage: 'fr-FR',
        country: 'ES'
      })

      // Should still process browser and country languages
      expect(result[0].type).toBe('header')
      const suggestedSection = result.slice(
        1,
        result.findIndex((lang) => lang.type === 'divider')
      )
      expect(suggestedSection).toHaveLength(2)
      expect(suggestedSection[0].id).toBe('fr') // Browser language
      expect(suggestedSection[1].id).toBe('es') // Country language
    })

    it('should handle undefined browserLanguage gracefully', () => {
      const result = siteLanguageReorder({
        languages: mockLanguages,
        siteLang: mockSiteLangEnglish,
        browserLanguage: undefined,
        country: 'ES'
      })

      const suggestedSection = result.slice(
        1,
        result.findIndex((lang) => lang.type === 'divider')
      )
      expect(suggestedSection).toHaveLength(2)
      expect(suggestedSection[0].id).toBe('en') // Site language
      expect(suggestedSection[1].id).toBe('es') // Country language
    })

    it('should handle undefined country gracefully', () => {
      const result = siteLanguageReorder({
        languages: mockLanguages,
        siteLang: mockSiteLangEnglish,
        browserLanguage: 'fr-FR',
        country: undefined
      })

      const suggestedSection = result.slice(
        1,
        result.findIndex((lang) => lang.type === 'divider')
      )
      expect(suggestedSection).toHaveLength(2)
      expect(suggestedSection[0].id).toBe('en') // Site language
      expect(suggestedSection[1].id).toBe('fr') // Browser language
    })

    it('should handle malformed browserLanguage', () => {
      const result = siteLanguageReorder({
        languages: mockLanguages,
        siteLang: mockSiteLangEnglish,
        browserLanguage: '', // Empty string
        country: undefined
      })

      // Should only have site language
      const suggestedSection = result.slice(
        1,
        result.findIndex((lang) => lang.type === 'divider')
      )
      expect(suggestedSection).toHaveLength(1)
      expect(suggestedSection[0].id).toBe('en')
    })
  })

  describe('output structure validation', () => {
    it('should not add divider when no remaining languages exist', () => {
      // Use only one language that will be suggested
      const singleLanguage = [mockLanguages[0]]

      const result = siteLanguageReorder({
        languages: singleLanguage,
        siteLang: mockSiteLangEnglish, // Same as the only language
        browserLanguage: undefined,
        country: undefined
      })

      // Should have header and suggested language only, no divider
      expect(result).toHaveLength(2)
      expect(result[0].type).toBe('header')
      expect(result[1].type).toBe('language')
      expect(result.find((lang) => lang.type === 'divider')).toBeUndefined()
    })

    it('should preserve all language properties in output', () => {
      const result = siteLanguageReorder({
        languages: mockLanguages,
        siteLang: mockSiteLangEnglish,
        browserLanguage: undefined,
        country: undefined
      })

      const languageItems = result.filter((item) => item.type === 'language')

      // Check that all original properties are preserved
      languageItems.forEach((item) => {
        const originalLang = mockLanguages.find((lang) => lang.id === item.id)
        if (originalLang) {
          expect(item.localName).toBe(originalLang.localName)
          expect(item.nativeName).toBe(originalLang.nativeName)
          expect(item.slug).toBe(originalLang.slug)
        }
      })
    })

    it('should return correct total count of items', () => {
      const result = siteLanguageReorder({
        languages: mockLanguages,
        siteLang: mockSiteLangEnglish,
        browserLanguage: 'fr-FR',
        country: 'ES'
      })

      // Should have: header + 3 suggested languages + divider + 2 remaining languages = 7 total
      expect(result).toHaveLength(7)

      const headerCount = result.filter((item) => item.type === 'header').length
      const dividerCount = result.filter(
        (item) => item.type === 'divider'
      ).length
      const languageCount = result.filter(
        (item) => item.type === 'language'
      ).length

      expect(headerCount).toBe(1)
      expect(dividerCount).toBe(1)
      expect(languageCount).toBe(mockLanguages.length) // All languages should be present
    })
  })
})
