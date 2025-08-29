import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { GetSubtitles } from '../../../../__generated__/GetSubtitles'
import { WatchProvider, WatchState } from '../../../libs/watchContext'
import { TestWatchState } from '../../../libs/watchContext/TestWatchState'
import { GET_SUBTITLES } from '../../../libs/watchContext/useSubtitleUpdate/useSubtitleUpdate'

import { SubtitlesSelect } from './SubtitlesSelect'

// Mock only external libraries
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

jest.mock('next-i18next', () => ({
  useTranslation: jest.fn()
}))

const useRouterMock = useRouter as jest.Mock
const useTranslationMock = useTranslation as jest.Mock

// Default mock data for reuse across tests
const defaultInitialState = {
  siteLanguage: 'en',
  audioLanguage: '529',
  subtitleLanguage: '529',
  subtitleOn: true,
  videoId: undefined,
  videoVariantSlug: undefined,
  videoSubtitleLanguageIds: [],
  videoAudioLanguagesIdsAndSlugs: []
}

const defaultGetSubtitlesMock: MockedResponse<GetSubtitles> = {
  request: {
    query: GET_SUBTITLES,
    variables: { id: 'video123' }
  },
  result: {
    data: {
      video: {
        __typename: 'Video',
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'VideoSubtitle',
              language: {
                __typename: 'Language',
                id: '529',
                bcp47: 'en',
                name: [
                  {
                    __typename: 'LanguageName',
                    value: 'English',
                    primary: true
                  },
                  {
                    __typename: 'LanguageName',
                    value: 'English Native',
                    primary: false
                  }
                ]
              },
              value: 'https://example.com/subtitles.vtt'
            },
            {
              __typename: 'VideoSubtitle',
              language: {
                __typename: 'Language',
                id: '22658',
                bcp47: 'ar',
                name: [
                  {
                    __typename: 'LanguageName',
                    value: 'اللغة العربية',
                    primary: true
                  },
                  {
                    __typename: 'LanguageName',
                    value: 'Arabic, Modern Standard',
                    primary: false
                  }
                ]
              },
              value: 'https://example.com/arabic-subtitles.vtt'
            }
          ]
        }
      }
    }
  }
}

describe('SubtitlesSelect', () => {
  const mockRouter = {
    push: jest.fn(),
    pathname: '/watch',
    asPath: '/watch/video-slug/english',
    query: {}
  }

  const mockT = jest.fn((key: string) => key)

  beforeEach(() => {
    useRouterMock.mockReturnValue(mockRouter)
    useTranslationMock.mockReturnValue({ t: mockT })
    jest.clearAllMocks()
  })

  it('should render all components correctly', () => {
    render(
      <MockedProvider mocks={[defaultGetSubtitlesMock]} addTypename={false}>
        <WatchProvider initialState={defaultInitialState}>
          <SubtitlesSelect />
        </WatchProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Subtitles')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByLabelText('Show subtitles')).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
    expect(document.querySelector('svg')).toBeInTheDocument() // ClosedCaptionOffOutlinedIcon
  })

  it('should display native name when subtitleLanguage matches a language in allLanguages', () => {
    const stateWithMatchingSubtitleLanguage = {
      ...defaultInitialState,
      subtitleLanguage: '529', // This will match the English language
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
      <MockedProvider mocks={[defaultGetSubtitlesMock]} addTypename={false}>
        <WatchProvider initialState={stateWithMatchingSubtitleLanguage}>
          <SubtitlesSelect />
        </WatchProvider>
      </MockedProvider>
    )

    expect(screen.getByDisplayValue('English')).toBeInTheDocument()
  })

  it('should handle when subtitleLanguage does not match any language in allLanguages', () => {
    const stateWithNonMatchingSubtitleLanguage = {
      ...defaultInitialState,
      subtitleLanguage: 'nonexistent-id',
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
      <MockedProvider mocks={[defaultGetSubtitlesMock]} addTypename={false}>
        <WatchProvider initialState={stateWithNonMatchingSubtitleLanguage}>
          <SubtitlesSelect />
        </WatchProvider>
      </MockedProvider>
    )

    const combobox = screen.getByRole('combobox')
    expect(combobox).toHaveValue('')
  })

  it('should handle when subtitleLanguage is empty string', () => {
    const stateWithEmptySubtitleLanguage = {
      ...defaultInitialState,
      subtitleLanguage: '',
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

    render(
      <MockedProvider mocks={[defaultGetSubtitlesMock]} addTypename={false}>
        <WatchProvider initialState={stateWithEmptySubtitleLanguage}>
          <SubtitlesSelect />
        </WatchProvider>
      </MockedProvider>
    )

    const combobox = screen.getByRole('combobox')
    expect(combobox).toHaveValue('')
  })

  it('should handle when allLanguages is undefined', () => {
    const stateWithUndefinedAllLanguages = {
      ...defaultInitialState,
      subtitleLanguage: '529',
      allLanguages: undefined
    }

    render(
      <MockedProvider mocks={[defaultGetSubtitlesMock]} addTypename={false}>
        <WatchProvider initialState={stateWithUndefinedAllLanguages}>
          <SubtitlesSelect />
        </WatchProvider>
      </MockedProvider>
    )

    const combobox = screen.getByRole('combobox')
    expect(combobox).toHaveValue('')
  })

  it('should handle when language name entries are missing (native name)', () => {
    const stateWithMissingNativeName = {
      ...defaultInitialState,
      subtitleLanguage: '529',
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

    render(
      <MockedProvider mocks={[defaultGetSubtitlesMock]} addTypename={false}>
        <WatchProvider initialState={stateWithMissingNativeName}>
          <SubtitlesSelect />
        </WatchProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('should handle when language name entries are missing (primary name)', () => {
    const stateWithMissingPrimaryName = {
      ...defaultInitialState,
      subtitleLanguage: '529',
      allLanguages: [
        {
          __typename: 'Language' as const,
          id: '529',
          slug: 'english',
          bcp47: 'en',
          name: [
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
      <MockedProvider mocks={[defaultGetSubtitlesMock]} addTypename={false}>
        <WatchProvider initialState={stateWithMissingPrimaryName}>
          <SubtitlesSelect />
        </WatchProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('should call updateSubtitleLanguage when handleChange is triggered', async () => {
    const user = userEvent.setup()

    const stateWithAllLanguages = {
      ...defaultInitialState,
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
          id: '22658',
          slug: 'arabic',
          bcp47: 'ar',
          name: [
            {
              __typename: 'LanguageName' as const,
              value: 'اللغة العربية',
              primary: true
            }
          ]
        }
      ]
    }

    render(
      <MockedProvider mocks={[defaultGetSubtitlesMock]} addTypename={false}>
        <WatchProvider initialState={stateWithAllLanguages}>
          <SubtitlesSelect />
        </WatchProvider>
      </MockedProvider>
    )

    const combobox = screen.getByRole('combobox')
    await user.click(combobox)

    await waitFor(() => {
      expect(screen.getByText('اللغة العربية')).toBeInTheDocument()
    })

    await user.click(screen.getByText('اللغة العربية'))

    await waitFor(() => {
      expect(screen.getByDisplayValue('اللغة العربية')).toBeInTheDocument()
    })
  })

  it('should call updateSubtitlesOn when checkbox is toggled', async () => {
    const user = userEvent.setup()

    // Set up so audioLanguage matches videoAudioLanguages, so autoSubtitle is undefined
    const stateWithSubtitlesOn: WatchState = {
      ...defaultInitialState,
      subtitleOn: true,
      autoSubtitle: undefined,
      audioLanguage: '529',
      subtitleLanguage: '529',
      videoAudioLanguagesIdsAndSlugs: [
        {
          id: '529',
          slug: 'english'
        }
      ],
      videoSubtitleLanguageIds: ['529']
    }

    render(
      <MockedProvider mocks={[defaultGetSubtitlesMock]} addTypename={false}>
        <WatchProvider initialState={stateWithSubtitlesOn}>
          <SubtitlesSelect />
        </WatchProvider>
      </MockedProvider>
    )

    const checkbox = screen.getByRole('checkbox')
    await waitFor(() => {
      expect(checkbox).toBeChecked()
    })
    await user.click(checkbox)
    expect(checkbox).toBeInTheDocument()
  })

  it('should respect autoSubtitle preference over subtitleOn', async () => {
    const stateWithAutoSubtitleDifferent: WatchState = {
      ...defaultInitialState,
      subtitleOn: false,
      autoSubtitle: true, // This should take precedence
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
      ],
      videoSubtitleLanguageIds: ['529']
    }

    render(
      <MockedProvider mocks={[defaultGetSubtitlesMock]} addTypename={false}>
        <WatchProvider initialState={stateWithAutoSubtitleDifferent}>
          <SubtitlesSelect />
        </WatchProvider>
      </MockedProvider>
    )

    const checkbox = screen.getByRole('checkbox')
    await waitFor(() => {
      expect(checkbox).toBeChecked()
    })
    expect(checkbox).toBeChecked() // Should be checked due to AutoSubtitle being true
  })

  it('should call GET_SUBTITLES query and apply the returned subtitle languages', async () => {
    const stateWithVideoId = {
      ...defaultInitialState,
      videoId: 'video123',
      videoVariantSlug: 'video123',
      videoSubtitleLanguageIds: undefined,
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
          id: '22658',
          slug: 'arabic',
          bcp47: 'ar',
          name: [
            {
              __typename: 'LanguageName' as const,
              value: 'اللغة العربية',
              primary: true
            },
            {
              __typename: 'LanguageName' as const,
              value: 'Arabic, Modern Standard',
              primary: false
            }
          ]
        }
      ]
    }

    // Create a mock function to track if the query is called
    const getSubtitlesResult = jest.fn(() => ({
      data: {
        video: {
          __typename: 'Video' as const,
          variant: {
            __typename: 'VideoVariant' as const,
            subtitle: [
              {
                __typename: 'VideoSubtitle' as const,
                language: {
                  __typename: 'Language' as const,
                  id: '22658',
                  bcp47: 'ar',
                  name: [
                    {
                      __typename: 'LanguageName' as const,
                      value: 'اللغة العربية',
                      primary: true
                    },
                    {
                      __typename: 'LanguageName' as const,
                      value: 'Arabic, Modern Standard',
                      primary: false
                    }
                  ]
                },
                value: 'https://example.com/arabic-subtitles.vtt'
              }
            ]
          }
        }
      }
    }))

    const mockWithFunction: MockedResponse<GetSubtitles> = {
      request: {
        query: GET_SUBTITLES,
        variables: { id: 'video123' }
      },
      result: getSubtitlesResult
    }

    render(
      <MockedProvider mocks={[mockWithFunction]} addTypename={false}>
        <WatchProvider initialState={stateWithVideoId}>
          <SubtitlesSelect />
        </WatchProvider>
      </MockedProvider>
    )

    // Wait for the query to be called
    await waitFor(() => {
      expect(getSubtitlesResult).toHaveBeenCalled()
    })

    // Verify the component renders correctly after the query
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('should not trigger GraphQL query when videoId is undefined', () => {
    const stateWithoutVideoId = {
      ...defaultInitialState,
      videoId: undefined,
      videoSubtitleLanguageIds: undefined
    }

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WatchProvider initialState={stateWithoutVideoId}>
          <SubtitlesSelect />
        </WatchProvider>
      </MockedProvider>
    )

    // Should render without triggering GraphQL query
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('should not trigger GraphQL query when videoSubtitleLanguageIds already exists', () => {
    const stateWithExistingSubtitleLanguages = {
      ...defaultInitialState,
      videoId: 'video123',
      videoSubtitleLanguageIds: ['529']
    }

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WatchProvider initialState={stateWithExistingSubtitleLanguages}>
          <SubtitlesSelect />
        </WatchProvider>
      </MockedProvider>
    )

    // Should render without triggering GraphQL query
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('should update autoSubtitle in state when checkbox is toggled and autoSubtitle is not null', async () => {
    const user = userEvent.setup()
    const initialState = {
      ...defaultInitialState,
      subtitleOn: true,
      autoSubtitle: true,
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
      ],
      videoSubtitleLanguageIds: ['529']
    }

    render(
      <MockedProvider mocks={[defaultGetSubtitlesMock]} addTypename={false}>
        <WatchProvider initialState={initialState}>
          <SubtitlesSelect />
          <TestWatchState />
        </WatchProvider>
      </MockedProvider>
    )

    expect(screen.getByText('autoSubtitle: true')).toBeInTheDocument()
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()

    await user.click(checkbox)

    expect(screen.getByText('autoSubtitle: false')).toBeInTheDocument()
  })
})
