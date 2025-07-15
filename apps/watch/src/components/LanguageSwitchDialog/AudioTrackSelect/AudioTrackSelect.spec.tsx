import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { GetLanguagesSlug } from '../../../../__generated__/GetLanguagesSlug'
import { WatchProvider } from '../../../libs/watchContext'
import { GET_LANGUAGES_SLUG } from '../../AudioLanguageDialog/AudioLanguageDialog'

import { AudioTrackSelect } from './AudioTrackSelect'

// Mock only external libraries
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

jest.mock('next-i18next', () => ({
  useTranslation: jest.fn()
}))

// Mock useLanguageActions hook specifically for testing onChange behavior
const mockUpdateAudioLanguage = jest.fn()
jest.mock('../../../libs/watchContext', () => ({
  ...jest.requireActual('../../../libs/watchContext'),
  useLanguageActions: () => ({
    updateAudioLanguage: mockUpdateAudioLanguage
  })
}))

const useRouterMock = useRouter as jest.Mock
const useTranslationMock = useTranslation as jest.Mock

// Default mock data for reuse across tests
const defaultInitialState = {
  siteLanguage: 'en',
  audioLanguage: '529',
  subtitleLanguage: '529',
  subtitleOn: false
}

const defaultGetLanguagesSlugMock: MockedResponse<GetLanguagesSlug> = {
  request: {
    query: GET_LANGUAGES_SLUG,
    variables: { id: 'video123' }
  },
  result: {
    data: {
      video: {
        __typename: 'Video',
        variantLanguagesWithSlug: [
          {
            __typename: 'LanguageWithSlug',
            slug: 'english',
            language: {
              __typename: 'Language',
              id: 'lang1',
              slug: 'english',
              name: [
                {
                  __typename: 'LanguageName',
                  value: 'English',
                  primary: true
                }
              ]
            }
          },
          {
            __typename: 'LanguageWithSlug',
            slug: 'spanish',
            language: {
              __typename: 'Language',
              id: 'lang2',
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
        ]
      }
    }
  }
}

describe('AudioTrackSelect', () => {
  const mockRouter = {
    push: jest.fn(),
    pathname: '/watch',
    asPath: '/watch/video-slug/english',
    query: {}
  }

  const mockT = jest.fn((key: string, options?: { value?: string }) => {
    if (key === 'Not available in {{value}}' && options?.value) {
      return `Not available in ${options.value}`
    }
    return key
  })

  beforeEach(() => {
    useRouterMock.mockReturnValue(mockRouter)
    useTranslationMock.mockReturnValue({ t: mockT })
    jest.clearAllMocks()
  })

  it('should render all components correctly', () => {
    render(
      <MockedProvider mocks={[defaultGetLanguagesSlugMock]} addTypename={false}>
        <WatchProvider initialState={defaultInitialState}>
          <AudioTrackSelect />
        </WatchProvider>
      </MockedProvider>
    )

    // Should render main elements
    expect(screen.getByText('Audio Track')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(document.querySelector('svg')).toBeInTheDocument() // SpatialAudioOffOutlinedIcon
  })

  it('should display native name when audioLanguage matches a language in allLanguages', () => {
    const initialLanguageState = {
      siteLanguage: 'en',
      audioLanguage: '529', // This will match the English language
      subtitleLanguage: '529',
      subtitleOn: false,
      allLanguages: [
        {
          __typename: 'Language' as const,
          id: '529',
          slug: 'english',
          bcp47: 'en',
          name: [
            {
              __typename: 'LanguageName' as const,
              value: 'English',
              primary: true
            },
            {
              __typename: 'LanguageName' as const,
              value: 'English Native',
              primary: false
            }
          ]
        }
      ]
    }

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WatchProvider initialState={initialLanguageState}>
          <AudioTrackSelect />
        </WatchProvider>
      </MockedProvider>
    )

    // Should display the native name (non-primary) in the top right
    expect(screen.getByText('English Native')).toBeInTheDocument()
  })

  it('should handle when audioLanguage does not match any language in allLanguages and path slug also does not match', () => {
    // Mock router with a path that doesn't match any language slug
    const mockRouterWithNonMatchingPath = {
      ...mockRouter,
      asPath: '/watch/video-slug/nonexistent-language'
    }
    useRouterMock.mockReturnValue(mockRouterWithNonMatchingPath)

    const initialLanguageState = {
      siteLanguage: 'en',
      audioLanguage: 'nonexistent-id', // This won't match any language
      subtitleLanguage: '529',
      subtitleOn: false,
      allLanguages: [
        {
          __typename: 'Language' as const,
          id: '529',
          slug: 'english',
          bcp47: 'en',
          name: [
            {
              __typename: 'LanguageName' as const,
              value: 'English',
              primary: true
            },
            {
              __typename: 'LanguageName' as const,
              value: 'English Native',
              primary: false
            }
          ]
        }
      ]
    }

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WatchProvider initialState={initialLanguageState}>
          <AudioTrackSelect />
        </WatchProvider>
      </MockedProvider>
    )

    // Should not display any native name since no language matches audioLanguage or path slug
    expect(screen.queryByText('English Native')).not.toBeInTheDocument()
    // But should still render the basic components
    expect(screen.getByText('Audio Track')).toBeInTheDocument()
  })

  it('should use path slug when currentAudioLanguage is undefined and audioLanguage does not match', () => {
    // Mock router with a path that matches a language slug
    const mockRouterWithMatchingPath = {
      ...mockRouter,
      asPath: '/watch/video-slug/spanish.html'
    }
    useRouterMock.mockReturnValue(mockRouterWithMatchingPath)

    const initialLanguageState = {
      siteLanguage: 'en',
      audioLanguage: 'nonexistent-id', // This won't match any language
      subtitleLanguage: '529',
      subtitleOn: false,
      currentAudioLanguage: undefined, // No current audio language
      allLanguages: [
        {
          __typename: 'Language' as const,
          id: '529',
          slug: 'english',
          bcp47: 'en',
          name: [
            {
              __typename: 'LanguageName' as const,
              value: 'English',
              primary: true
            },
            {
              __typename: 'LanguageName' as const,
              value: 'English Native',
              primary: false
            }
          ]
        },
        {
          __typename: 'Language' as const,
          id: '496',
          slug: 'spanish',
          bcp47: 'es',
          name: [
            {
              __typename: 'LanguageName' as const,
              value: 'Spanish',
              primary: true
            },
            {
              __typename: 'LanguageName' as const,
              value: 'Español',
              primary: false
            }
          ]
        }
      ]
    }

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WatchProvider initialState={initialLanguageState}>
          <AudioTrackSelect />
        </WatchProvider>
      </MockedProvider>
    )

    // Should display Spanish native name since path slug 'spanish' matches
    expect(screen.getByText('Español')).toBeInTheDocument()
    expect(screen.getByText('Audio Track')).toBeInTheDocument()
  })

  it('should prioritize currentAudioLanguage over path slug', async () => {
    // Mock router with a path that matches a different language
    const mockRouterWithDifferentPath = {
      ...mockRouter,
      asPath: '/watch/video-slug/english.html' // the slug is english but the audio language is spanish
    }
    useRouterMock.mockReturnValue(mockRouterWithDifferentPath)

    const initialLanguageState = {
      siteLanguage: 'en',
      audioLanguage: '496', // This value is gained from cookies and not slug path, this is required to calculate the currentAudioLanguage
      subtitleLanguage: '529',
      subtitleOn: false,
      videoAudioLanguages: [
        {
          __typename: 'LanguageWithSlug' as const,
          slug: 'spanish',
          language: {
            __typename: 'Language' as const,
            id: '496',
            slug: 'spanish',
            name: [
              {
                __typename: 'LanguageName' as const,
                value: 'Spanish',
                primary: true
              }
            ]
          }
        }
      ],
      allLanguages: [
        {
          __typename: 'Language' as const,
          id: '529',
          slug: 'english',
          bcp47: 'en',
          name: [
            {
              __typename: 'LanguageName' as const,
              value: 'English',
              primary: true
            },
            {
              __typename: 'LanguageName' as const,
              value: 'English Native',
              primary: false
            }
          ]
        },
        {
          __typename: 'Language' as const,
          id: '496',
          slug: 'spanish',
          bcp47: 'es',
          name: [
            {
              __typename: 'LanguageName' as const,
              value: 'Spanish',
              primary: true
            },
            {
              __typename: 'LanguageName' as const,
              value: 'Español',
              primary: false
            }
          ]
        }
      ]
    }

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WatchProvider initialState={initialLanguageState}>
          <AudioTrackSelect />
        </WatchProvider>
      </MockedProvider>
    )

    // Should display Spanish native name from currentAudioLanguage, not English from path
    await waitFor(() => {
      expect(screen.getByText('Español')).toBeInTheDocument()
      expect(screen.queryByText('English Native')).not.toBeInTheDocument()
      expect(screen.getByText('Audio Track')).toBeInTheDocument()
    })
  })

  it('should handle when allLanguages is null/undefined', () => {
    const initialLanguageState = {
      siteLanguage: 'en',
      audioLanguage: '529',
      subtitleLanguage: '529',
      subtitleOn: false,
      allLanguages: undefined // Undefined allLanguages
    }

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WatchProvider initialState={initialLanguageState}>
          <AudioTrackSelect />
        </WatchProvider>
      </MockedProvider>
    )

    // Should not display any native name since allLanguages is falsy
    expect(screen.queryByText('English Native')).not.toBeInTheDocument()
    expect(screen.getByText('Audio Track')).toBeInTheDocument()
  })

  it('should handle language with missing non-primary name', () => {
    const initialLanguageState = {
      siteLanguage: 'en',
      audioLanguage: '529',
      subtitleLanguage: '529',
      subtitleOn: false,
      allLanguages: [
        {
          __typename: 'Language' as const,
          id: '529',
          slug: 'english',
          bcp47: 'en',
          name: [
            {
              __typename: 'LanguageName' as const,
              value: 'English Only',
              primary: true
            }
            // Missing non-primary (native) name
          ]
        }
      ]
    }

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WatchProvider initialState={initialLanguageState}>
          <AudioTrackSelect />
        </WatchProvider>
      </MockedProvider>
    )

    // Should not crash and should render basic components
    expect(screen.getByText('Audio Track')).toBeInTheDocument()
    // Native name area should be empty or not show anything problematic
  })

  it('should handle language with missing primary name', () => {
    const initialLanguageState = {
      siteLanguage: 'en',
      audioLanguage: '529',
      subtitleLanguage: '529',
      subtitleOn: false,
      allLanguages: [
        {
          __typename: 'Language' as const,
          id: '529',
          slug: 'english',
          bcp47: 'en',
          name: [
            {
              __typename: 'LanguageName' as const,
              value: 'Native Only',
              primary: false
            }
            // Missing primary name
          ]
        }
      ]
    }

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WatchProvider initialState={initialLanguageState}>
          <AudioTrackSelect />
        </WatchProvider>
      </MockedProvider>
    )

    // Should display the native name in the top right
    expect(screen.getByText('Native Only')).toBeInTheDocument()
    expect(screen.getByText('Audio Track')).toBeInTheDocument()
  })

  it('should handle when preferred language is available for video', async () => {
    const initialLanguageState = {
      siteLanguage: 'en',
      audioLanguage: '529', // User prefers English
      subtitleLanguage: '529',
      subtitleOn: false,
      videoId: 'video123',
      allLanguages: [
        {
          __typename: 'Language' as const,
          id: '529',
          slug: 'english',
          bcp47: 'en',
          name: [
            {
              __typename: 'LanguageName' as const,
              value: 'English',
              primary: true
            },
            {
              __typename: 'LanguageName' as const,
              value: 'English Native',
              primary: false
            }
          ]
        }
      ],
      videoAudioLanguages: [
        {
          __typename: 'LanguageWithSlug' as const,
          slug: 'english',
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
          }
        }
      ],
      currentAudioLanguage: {
        __typename: 'LanguageWithSlug' as const,
        slug: 'english',
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
        }
      }
    }

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WatchProvider initialState={initialLanguageState}>
          <AudioTrackSelect />
        </WatchProvider>
      </MockedProvider>
    )

    // Wait for selectLanguageForVideo logic to complete
    await waitFor(() => {
      expect(screen.getByText('Audio Track')).toBeInTheDocument()
      // Should show "2000 translations" since preferred language is available
      expect(screen.getByText('2000 translations')).toBeInTheDocument()
    })
  })

  it('should show "Not available in [language]" when preferred language is not available for video', async () => {
    const initialLanguageState = {
      siteLanguage: 'en',
      audioLanguage: '529', // User prefers English
      subtitleLanguage: '529',
      subtitleOn: false,
      videoId: 'video123',
      allLanguages: [
        {
          __typename: 'Language' as const,
          id: '529',
          slug: 'english',
          bcp47: 'en',
          name: [
            {
              __typename: 'LanguageName' as const,
              value: 'English',
              primary: true
            }
          ]
        },
        {
          __typename: 'Language' as const,
          id: '496',
          slug: 'spanish',
          bcp47: 'es',
          name: [
            {
              __typename: 'LanguageName' as const,
              value: 'Spanish',
              primary: true
            }
          ]
        }
      ],
      videoAudioLanguages: [
        {
          __typename: 'LanguageWithSlug' as const,
          slug: 'spanish', // Only Spanish available for this video
          language: {
            __typename: 'Language' as const,
            id: '496',
            slug: 'spanish',
            name: [
              {
                __typename: 'LanguageName' as const,
                value: 'Spanish',
                primary: true
              }
            ]
          }
        }
      ],
      currentAudioLanguage: {
        __typename: 'LanguageWithSlug' as const,
        slug: 'spanish', // Video is playing in Spanish (not user's preference)
        language: {
          __typename: 'Language' as const,
          id: '496',
          slug: 'spanish',
          name: [
            {
              __typename: 'LanguageName' as const,
              value: 'Spanish',
              primary: true
            }
          ]
        }
      }
    }

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WatchProvider initialState={initialLanguageState}>
          <AudioTrackSelect />
        </WatchProvider>
      </MockedProvider>
    )

    // Wait for selectLanguageForVideo logic to complete
    await waitFor(() => {
      expect(screen.getByText('Audio Track')).toBeInTheDocument()
      // Should show "Not available in english" since preferred language is not available
      expect(screen.getByText('Not available in english')).toBeInTheDocument()
    })
  })

  it('should display default helper text when videoId is null', () => {
    const initialLanguageState = {
      siteLanguage: 'en',
      audioLanguage: '529',
      subtitleLanguage: '529',
      subtitleOn: false,
      videoId: undefined, // No videoId
      allLanguages: [
        {
          __typename: 'Language' as const,
          id: '529',
          slug: 'english',
          bcp47: 'en',
          name: [
            {
              __typename: 'LanguageName' as const,
              value: 'English',
              primary: true
            },
            {
              __typename: 'LanguageName' as const,
              value: 'English Native',
              primary: false
            }
          ]
        }
      ]
    }

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WatchProvider initialState={initialLanguageState}>
          <AudioTrackSelect />
        </WatchProvider>
      </MockedProvider>
    )

    // Should render with default state when no videoId
    expect(screen.getByText('Audio Track')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()

    // Should display default helper text
    expect(screen.getByText('2000 translations')).toBeInTheDocument()
  })

  it('should call GET_LANGUAGES_SLUG query when videoId is present and videoAudioLanguages is null', async () => {
    const initialLanguageState = {
      siteLanguage: 'en',
      audioLanguage: '529',
      subtitleLanguage: '529',
      subtitleOn: false,
      videoId: 'video123', // Set videoId
      videoAudioLanguages: undefined, // No audio languages yet
      allLanguages: [
        {
          __typename: 'Language' as const,
          id: '529',
          slug: 'english',
          bcp47: 'en',
          name: [
            {
              __typename: 'LanguageName' as const,
              value: 'English',
              primary: true
            }
          ]
        }
      ]
    }

    // Create a mock function to track if the query is called
    const getLanguagesSlugResult = jest.fn(() => ({
      data: {
        video: {
          __typename: 'Video' as const,
          variantLanguagesWithSlug: [
            {
              __typename: 'LanguageWithSlug' as const,
              slug: 'english',
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
              }
            }
          ]
        }
      }
    }))

    const mockWithFunction: MockedResponse<GetLanguagesSlug> = {
      request: {
        query: GET_LANGUAGES_SLUG,
        variables: { id: 'video123' }
      },
      result: getLanguagesSlugResult
    }

    render(
      <MockedProvider mocks={[mockWithFunction]} addTypename={false}>
        <WatchProvider initialState={initialLanguageState}>
          <AudioTrackSelect />
        </WatchProvider>
      </MockedProvider>
    )

    // Wait for the GraphQL query to be called
    await waitFor(() => {
      expect(getLanguagesSlugResult).toHaveBeenCalled()
    })

    // Verify the component renders correctly after the query
    expect(screen.getByText('Audio Track')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })
})
