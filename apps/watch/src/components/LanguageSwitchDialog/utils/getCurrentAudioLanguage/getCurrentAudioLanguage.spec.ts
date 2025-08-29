import { LanguageOption } from '@core/shared/ui/LanguageAutocomplete'

import { getCurrentAudioLanguage } from './getCurrentAudioLanguage'

const mockLanguages = [
  {
    id: '529',
    slug: 'english',
    name: [
      { primary: true, value: 'English', id: '529' },
      { primary: false, value: 'English', id: '529' }
    ]
  },
  {
    id: '496',
    slug: 'spanish',
    name: [
      { primary: true, value: 'Spanish', id: '496' },
      { primary: false, value: 'Español', id: '496' }
    ]
  },
  {
    id: '1106',
    slug: 'french',
    name: [
      { primary: true, value: 'French', id: '1106' },
      { primary: false, value: 'Français', id: '1106' }
    ]
  }
]

const expectedEnglishOption: LanguageOption = {
  id: '529',
  localName: 'English',
  nativeName: 'English',
  slug: 'english'
}

const expectedSpanishOption: LanguageOption = {
  id: '496',
  localName: 'Spanish',
  nativeName: 'Español',
  slug: 'spanish'
}

const expectedFrenchOption: LanguageOption = {
  id: '1106',
  localName: 'French',
  nativeName: 'Français',
  slug: 'french'
}

describe('getCurrentAudioLanguage', () => {
  describe('when allLanguages is undefined', () => {
    it('should return undefined', () => {
      const result = getCurrentAudioLanguage({
        allLanguages: undefined,
        routerAsPath: '/watch/jesus/english.html',
        audioLanguage: '529'
      })

      expect(result).toBeUndefined()
    })
  })

  describe('when allLanguages is empty', () => {
    it('should return undefined', () => {
      const result = getCurrentAudioLanguage({
        allLanguages: [],
        routerAsPath: '/watch/jesus/english.html',
        audioLanguage: '529'
      })

      expect(result).toBeUndefined()
    })
  })

  describe('Priority 1: currentAudioLanguage', () => {
    it('should return language from currentAudioLanguage when available', () => {
      const result = getCurrentAudioLanguage({
        allLanguages: mockLanguages,
        currentAudioLanguage: { id: '496', slug: 'spanish' },
        routerAsPath: '/watch/jesus/english.html',
        audioLanguage: '529'
      })

      expect(result).toEqual(expectedSpanishOption)
    })
  })

  describe('Priority 2: slug from path', () => {
    it('should extract language from path when currentAudioLanguage is not available', () => {
      const result = getCurrentAudioLanguage({
        allLanguages: mockLanguages,
        currentAudioLanguage: undefined,
        routerAsPath: '/watch/jesus/spanish.html',
        audioLanguage: '529'
      })

      expect(result).toEqual(expectedSpanishOption)
    })

    it('should handle path without .html extension', () => {
      const result = getCurrentAudioLanguage({
        allLanguages: mockLanguages,
        currentAudioLanguage: undefined,
        routerAsPath: '/watch/jesus/french',
        audioLanguage: '529'
      })

      expect(result).toEqual(expectedFrenchOption)
    })

    it('should handle paths without language segment', () => {
      const result = getCurrentAudioLanguage({
        allLanguages: mockLanguages,
        currentAudioLanguage: undefined,
        routerAsPath: '/watch',
        audioLanguage: '529'
      })

      expect(result).toEqual(expectedEnglishOption)
    })
  })

  describe('Priority 3: audioLanguage fallback', () => {
    it('should use audioLanguage when currentAudioLanguage and path language are not available', () => {
      const result = getCurrentAudioLanguage({
        allLanguages: mockLanguages,
        currentAudioLanguage: undefined,
        routerAsPath: '/watch/jesus/non-existent.html',
        audioLanguage: '1106'
      })

      expect(result).toEqual(expectedFrenchOption)
    })

    it('should return undefined if audioLanguage is not found in languages', () => {
      const result = getCurrentAudioLanguage({
        allLanguages: mockLanguages,
        currentAudioLanguage: undefined,
        routerAsPath: '/watch/jesus/non-existent.html',
        audioLanguage: 'non-existent-id'
      })

      expect(result).toBeUndefined()
    })
  })

  describe('Priority order', () => {
    it('should prioritize currentAudioLanguage over path and audioLanguage', () => {
      const result = getCurrentAudioLanguage({
        allLanguages: mockLanguages,
        currentAudioLanguage: { id: '1106', slug: 'french' }, // French
        routerAsPath: '/watch/jesus/spanish.html', // Spanish in path
        audioLanguage: '529' // English as fallback
      })

      expect(result).toEqual(expectedFrenchOption) // Should use French from currentAudioLanguage
    })

    it('should prioritize path over audioLanguage when currentAudioLanguage is not available', () => {
      const result = getCurrentAudioLanguage({
        allLanguages: mockLanguages,
        currentAudioLanguage: undefined,
        routerAsPath: '/watch/jesus/spanish.html', // Spanish in path
        audioLanguage: '529' // English as fallback
      })

      expect(result).toEqual(expectedSpanishOption) // Should use Spanish from path
    })
  })

  describe('edge cases', () => {
    it('should handle language without native name', () => {
      const languagesWithoutNative = [
        {
          id: '529',
          slug: 'english',
          name: [{ primary: true, value: 'English', id: '529' }]
        }
      ]

      const result = getCurrentAudioLanguage({
        allLanguages: languagesWithoutNative,
        currentAudioLanguage: { id: '529', slug: 'english' },
        routerAsPath: '/watch/jesus/spanish.html',
        audioLanguage: '496'
      })

      expect(result).toEqual({
        id: '529',
        localName: 'English',
        nativeName: undefined,
        slug: 'english'
      })
    })

    it('should handle language without local name', () => {
      const languagesWithoutLocal = [
        {
          id: '529',
          slug: 'english',
          name: [{ primary: false, value: 'English Native', id: '529' }]
        }
      ]

      const result = getCurrentAudioLanguage({
        allLanguages: languagesWithoutLocal,
        currentAudioLanguage: { id: '529', slug: 'english' },
        routerAsPath: '/watch/jesus/spanish.html',
        audioLanguage: '496'
      })

      expect(result).toEqual({
        id: '529',
        localName: undefined,
        nativeName: 'English Native',
        slug: 'english'
      })
    })

    it('should handle empty path segments', () => {
      const result = getCurrentAudioLanguage({
        allLanguages: mockLanguages,
        currentAudioLanguage: undefined,
        routerAsPath: '/',
        audioLanguage: '529'
      })

      expect(result).toEqual(expectedEnglishOption) // Should fall back to audioLanguage
    })

    it('should return undefined when all parameters are undefined/unavailable', () => {
      const result = getCurrentAudioLanguage({
        allLanguages: mockLanguages,
        currentAudioLanguage: undefined,
        routerAsPath: '/watch/jesus/non-existent.html',
        audioLanguage: undefined
      })

      expect(result).toBeUndefined()
    })
  })
})
