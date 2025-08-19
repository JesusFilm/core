import { waitFor } from '@testing-library/react'
import { NextRouter } from 'next/router'

import { getCookie } from '../../cookieHandler'

import { audioLanguageRedirect } from './audioLanguageRedirect'

// Mock dependencies
jest.mock('../../cookieHandler', () => ({
  getCookie: jest.fn()
}))

const mockGetCookie = getCookie as jest.MockedFunction<
  (key: string) => string | null | undefined
>

describe('audioLanguageRedirect', () => {
  let mockRouter: jest.Mocked<NextRouter>

  const mockLanguageVariantsData = {
    video: {
      __typename: 'Video' as const,
      variantLanguagesWithSlug: [
        {
          __typename: 'LanguageWithSlug' as const,
          language: {
            __typename: 'Language' as const,
            id: '529',
            slug: 'english',
            name: [
              {
                __typename: 'LanguageName' as const,
                value: 'English',
                primary: true
              }
            ]
          },
          slug: 'video/english'
        },
        {
          __typename: 'LanguageWithSlug' as const,
          language: {
            __typename: 'Language' as const,
            id: '22658',
            slug: 'spanish',
            name: [
              {
                __typename: 'LanguageName' as const,
                value: 'Spanish',
                primary: true
              }
            ]
          },
          slug: 'video/spanish'
        }
      ]
    }
  }

  beforeEach(() => {
    mockRouter = {
      replace: jest.fn(),
      asPath: '/watch/video/english.html'
    } as any

    mockGetCookie.mockClear()
    mockRouter.replace.mockClear()
  })

  it('should not call router.replace when languageVariantsLoading or cookieAudioLanguageId is null', async () => {
    // Test languageVariantsLoading = true
    mockGetCookie.mockReturnValue('529')
    await audioLanguageRedirect({
      languageVariantsLoading: true,
      languageVariantsData: mockLanguageVariantsData as any,
      router: mockRouter,
      containerSlug: undefined
    })
    await waitFor(() => {
      expect(mockRouter.replace).not.toHaveBeenCalled()
    })

    // Test cookieAudioLanguageId = null
    mockGetCookie.mockReturnValue(null)
    await audioLanguageRedirect({
      languageVariantsLoading: false,
      languageVariantsData: mockLanguageVariantsData as any,
      router: mockRouter,
      containerSlug: undefined
    })
    await waitFor(() => {
      expect(mockRouter.replace).not.toHaveBeenCalled()
    })
  })

  it('should not call router.replace when selectedLanguageSlug is null or selectedLanguage equals currentLanguageSlug', async () => {
    // Test selectedLanguageSlug = null (language not found)
    mockGetCookie.mockReturnValue('999') // Non-existent language ID
    await audioLanguageRedirect({
      languageVariantsLoading: false,
      languageVariantsData: mockLanguageVariantsData as any,
      router: mockRouter,
      containerSlug: undefined
    })
    await waitFor(() => {
      expect(mockRouter.replace).not.toHaveBeenCalled()
    })

    // Test selectedLanguage === currentLanguageSlug
    mockGetCookie.mockReturnValue('529') // English
    mockRouter.asPath = '/watch/video/english.html'
    await audioLanguageRedirect({
      languageVariantsLoading: false,
      languageVariantsData: mockLanguageVariantsData as any,
      router: mockRouter,
      containerSlug: undefined
    })
    await waitFor(() => {
      expect(mockRouter.replace).not.toHaveBeenCalled()
    })
  })

  it('should call router.replace with container slug and selectedLanguageSlug', async () => {
    mockGetCookie.mockReturnValue('22658') // Spanish
    mockRouter.asPath = '/watch/video/english.html' // Currently on English

    await audioLanguageRedirect({
      languageVariantsLoading: false,
      languageVariantsData: mockLanguageVariantsData as any,
      router: mockRouter,
      containerSlug: 'jesus-film'
    })

    expect(mockRouter.replace).toHaveBeenCalledWith(
      '/watch/jesus-film/video/spanish'
    )
  })

  it('should call router.replace with no containerSlug, but with selectedLanguageSlug', async () => {
    mockGetCookie.mockReturnValue('22658') // Spanish
    mockRouter.asPath = '/watch/video/english.html' // Currently on English

    await audioLanguageRedirect({
      languageVariantsLoading: false,
      languageVariantsData: mockLanguageVariantsData as any,
      router: mockRouter,
      containerSlug: undefined
    })

    expect(mockRouter.replace).toHaveBeenCalledWith('/watch/video/spanish')
  })

  it('should not call router.replace when noredirect is true', async () => {
    mockRouter.query = { noredirect: 'true' }
    await audioLanguageRedirect({
      languageVariantsLoading: false,
      languageVariantsData: mockLanguageVariantsData as any,
      router: mockRouter,
      containerSlug: undefined
    })

    expect(mockRouter.replace).not.toHaveBeenCalled()
  })
})
