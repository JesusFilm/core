import { NextRouter } from 'next/router'
import { TFunction } from 'next-i18next'

import { GetAllLanguages_languages as Language } from '../../../../../__generated__/GetAllLanguages'
import { GetLanguagesSlug_video_variantLanguagesWithSlug as AudioLanguage } from '../../../../../__generated__/GetLanguagesSlug'

import { selectLanguageForVideo } from './audioLanguageSetter'

// Mock data for testing
const mockLanguages: Language[] = [
  {
    __typename: 'Language',
    id: '529',
    slug: 'english',
    bcp47: 'en',
    name: [
      {
        __typename: 'LanguageName',
        value: 'English',
        primary: true
      }
    ]
  },
  {
    __typename: 'Language',
    id: '496',
    slug: 'spanish',
    bcp47: 'es',
    name: [
      {
        __typename: 'LanguageName',
        value: 'Spanish',
        primary: true
      }
    ]
  },
  {
    __typename: 'Language',
    id: '22658',
    slug: 'french',
    bcp47: 'fr',
    name: [
      {
        __typename: 'LanguageName',
        value: 'French',
        primary: true
      }
    ]
  }
]

const mockCurrentAudioLanguageEnglish: AudioLanguage = {
  __typename: 'LanguageWithSlug',
  slug: 'english',
  language: {
    __typename: 'Language',
    id: '529',
    slug: 'english',
    name: [
      {
        __typename: 'LanguageName',
        value: 'English',
        primary: true
      }
    ]
  }
}

const mockCurrentAudioLanguageSpanish: AudioLanguage = {
  __typename: 'LanguageWithSlug',
  slug: 'spanish',
  language: {
    __typename: 'Language',
    id: '496',
    slug: 'spanish',
    name: [
      {
        __typename: 'LanguageName',
        value: 'Spanish',
        primary: true
      }
    ]
  }
}

describe('audioLanguageSetter', () => {
  let mockRouter: NextRouter
  let mockSetHelperText: jest.Mock
  let mockT: TFunction

  beforeEach(() => {
    mockRouter = {
      push: jest.fn(),
      asPath: '/watch/video-slug/english',
      pathname: '/watch/[videoSlug]/[languageSlug]',
      query: {}
    } as unknown as NextRouter

    mockSetHelperText = jest.fn()

    mockT = jest.fn((key: string, options?: any) => {
      if (key === '2000 translations') return '2000 translations'
      if (key === 'Not available in {{value}}' && options?.value) {
        return `Not available in ${options.value}`
      }
      return key
    }) as unknown as TFunction

    jest.clearAllMocks()
  })

  describe('selectLanguageForVideo', () => {
    it('should select user preferred language when it matches current audio language (Scenario 1)', () => {
      selectLanguageForVideo({
        currentAudioLanguage: mockCurrentAudioLanguageEnglish,
        allLanguages: mockLanguages,
        audioLanguage: '529', // User prefers English
        router: mockRouter,
        setHelperText: mockSetHelperText,
        t: mockT
      })

      // Should show preferred language helper text
      expect(mockSetHelperText).toHaveBeenCalledWith('2000 translations')

      // Should update URL to preferred language
      expect(mockRouter.push).not.toHaveBeenCalled() // URL already matches
    })

    it('should update URL when preferred language matches but URL is different', () => {
      mockRouter.asPath = '/watch/video-slug/spanish' // URL shows Spanish but user prefers English

      selectLanguageForVideo({
        currentAudioLanguage: mockCurrentAudioLanguageEnglish,
        allLanguages: mockLanguages,
        audioLanguage: '529', // User prefers English
        router: mockRouter,
        setHelperText: mockSetHelperText,
        t: mockT
      })

      // Should show preferred language helper text
      expect(mockSetHelperText).toHaveBeenCalledWith('2000 translations')

      // Should update URL to match preferred language
      expect(mockRouter.push).toHaveBeenCalledWith('/watch/video-slug/english')
    })

    it('should handle different preference when current audio language differs from user preference (Scenario 2)', () => {
      selectLanguageForVideo({
        currentAudioLanguage: mockCurrentAudioLanguageSpanish, // Video has Spanish
        allLanguages: mockLanguages,
        audioLanguage: '529', // User prefers English
        router: mockRouter,
        setHelperText: mockSetHelperText,
        t: mockT
      })

      // Should show "not available" message since user prefers English but video has Spanish
      expect(mockSetHelperText).toHaveBeenCalledWith('Not available in english')

      // Should update URL to match current audio language (Spanish)
      expect(mockRouter.push).toHaveBeenCalledWith('/watch/video-slug/spanish')
    })

    it('should use path language when no current audio language is available (Scenario 3)', () => {
      mockRouter.asPath = '/watch/video-slug/french' // URL shows French

      selectLanguageForVideo({
        currentAudioLanguage: undefined, // No current audio language
        allLanguages: mockLanguages,
        audioLanguage: '529', // User prefers English
        router: mockRouter,
        setHelperText: mockSetHelperText,
        t: mockT
      })

      // Should show "not available" message since user prefers English but path shows French
      expect(mockSetHelperText).toHaveBeenCalledWith('Not available in english')

      // Should not update URL since we're using path language
      expect(mockRouter.push).not.toHaveBeenCalled()
    })

    it('should fallback to preferred language when no other options available (Scenario 4)', () => {
      selectLanguageForVideo({
        currentAudioLanguage: undefined, // No current audio language
        allLanguages: mockLanguages,
        audioLanguage: '529', // User prefers English
        router: mockRouter,
        setHelperText: mockSetHelperText,
        t: mockT
      })

      // Should show preferred language helper text
      expect(mockSetHelperText).toHaveBeenCalledWith('2000 translations')

      // Should not update URL
      expect(mockRouter.push).not.toHaveBeenCalled()
    })

    it('should handle when allLanguages is undefined', () => {
      selectLanguageForVideo({
        currentAudioLanguage: mockCurrentAudioLanguageEnglish,
        allLanguages: undefined,
        audioLanguage: '529',
        router: mockRouter,
        setHelperText: mockSetHelperText,
        t: mockT
      })

      // Should not crash and not call any functions
      expect(mockSetHelperText).not.toHaveBeenCalled()
      expect(mockRouter.push).not.toHaveBeenCalled()
    })

    it('should handle when preferred language is not found in allLanguages', () => {
      selectLanguageForVideo({
        currentAudioLanguage: mockCurrentAudioLanguageSpanish,
        allLanguages: mockLanguages,
        audioLanguage: 'nonexistent-id', // User prefers non-existent language
        router: mockRouter,
        setHelperText: mockSetHelperText,
        t: mockT
      })

      // Should show no preference message since preferred language doesn't exist
      expect(mockSetHelperText).toHaveBeenCalledWith('2000 translations')

      // Should update URL to match current audio language
      expect(mockRouter.push).toHaveBeenCalledWith('/watch/video-slug/spanish')
    })

    it('should handle URL with .html extension', () => {
      mockRouter.asPath = '/watch/video-slug/spanish.html'

      selectLanguageForVideo({
        currentAudioLanguage: mockCurrentAudioLanguageEnglish,
        allLanguages: mockLanguages,
        audioLanguage: '529', // User prefers English
        router: mockRouter,
        setHelperText: mockSetHelperText,
        t: mockT
      })

      // Should update URL to English, replacing the .html path
      expect(mockRouter.push).toHaveBeenCalledWith('/watch/video-slug/english')
    })

    it('should handle complex URL path correctly', () => {
      mockRouter.asPath = '/watch/some-video-title/spanish'

      selectLanguageForVideo({
        currentAudioLanguage: mockCurrentAudioLanguageEnglish,
        allLanguages: mockLanguages,
        audioLanguage: '529', // User prefers English
        router: mockRouter,
        setHelperText: mockSetHelperText,
        t: mockT
      })

      // Should update URL correctly
      expect(mockRouter.push).toHaveBeenCalledWith(
        '/watch/some-video-title/english'
      )
    })

    it('should not update URL when current audio language slug matches URL', () => {
      mockRouter.asPath = '/watch/video-slug/spanish'

      selectLanguageForVideo({
        currentAudioLanguage: mockCurrentAudioLanguageSpanish,
        allLanguages: mockLanguages,
        audioLanguage: '529', // User prefers English but video has Spanish
        router: mockRouter,
        setHelperText: mockSetHelperText,
        t: mockT
      })

      // Should not update URL since it already matches current audio language
      expect(mockRouter.push).not.toHaveBeenCalled()

      // Should show "not available" message
      expect(mockSetHelperText).toHaveBeenCalledWith('Not available in english')
    })

    it('should handle when current audio language is not found in allLanguages', () => {
      const unknownAudioLanguage: AudioLanguage = {
        __typename: 'LanguageWithSlug',
        slug: 'unknown',
        language: {
          __typename: 'Language',
          id: 'unknown-id',
          slug: 'unknown',
          name: [
            {
              __typename: 'LanguageName',
              value: 'Unknown',
              primary: true
            }
          ]
        }
      }

      // Set URL to Spanish to ensure we test Scenario 3 (path language)
      mockRouter.asPath = '/watch/video-slug/spanish'

      selectLanguageForVideo({
        currentAudioLanguage: unknownAudioLanguage,
        allLanguages: mockLanguages,
        audioLanguage: '529', // User prefers English
        router: mockRouter,
        setHelperText: mockSetHelperText,
        t: mockT
      })

      // When current audio language is not found in allLanguages, it skips Scenario 2
      // Since Scenario 1 doesn't match (currentAudioLanguage.language.id !== preferredAudioLanguage.id)
      // and Scenario 2 doesn't match (matchingLanguage is undefined)
      // and Scenario 3 doesn't apply (currentAudioLanguage != null, so it doesn't reach else if)
      // and Scenario 4 doesn't apply (currentAudioLanguage != null, so it doesn't reach final else if)
      // The function exits without calling setHelperText
      expect(mockSetHelperText).not.toHaveBeenCalled()
    })

    it('should handle empty path correctly', () => {
      mockRouter.asPath = '/watch/'

      selectLanguageForVideo({
        currentAudioLanguage: undefined,
        allLanguages: mockLanguages,
        audioLanguage: '529', // User prefers English
        router: mockRouter,
        setHelperText: mockSetHelperText,
        t: mockT
      })

      // Should fallback to preferred language
      expect(mockSetHelperText).toHaveBeenCalledWith('2000 translations')
      expect(mockRouter.push).not.toHaveBeenCalled()
    })
  })
})
