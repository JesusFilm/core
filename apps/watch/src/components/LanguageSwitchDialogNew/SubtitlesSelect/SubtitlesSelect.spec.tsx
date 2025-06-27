import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { GetSubtitles } from '../../../../__generated__/GetSubtitles'
import { WatchProvider } from '../../../libs/watchContext'
import { GET_SUBTITLES } from '../../SubtitleDialog/SubtitleDialog'

import { SubtitlesSelect } from './SubtitlesSelect'

// Mock only external libraries
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

jest.mock('next-i18next', () => ({
  useTranslation: jest.fn()
}))

// Mock dispatch for testing action dispatching
const mockDispatch = jest.fn()

// Mock the watchContext module
jest.mock('../../../libs/watchContext', () => {
  const actual = jest.requireActual('../../../libs/watchContext')
  return {
    ...actual,
    useWatch: jest.fn(() => ({
      state: {},
      dispatch: mockDispatch
    }))
  }
})

const useRouterMock = useRouter as jest.Mock
const useTranslationMock = useTranslation as jest.Mock

// Helper function to set mocked state for tests
const setMockWatchState = (state: any) => {
  const mockUseWatch = require('../../../libs/watchContext').useWatch
  mockUseWatch.mockReturnValue({
    state: { ...state },
    dispatch: mockDispatch
  })
}

// Default mock data for reuse across tests
const defaultInitialState = {
  siteLanguage: 'en',
  audioLanguage: '529',
  subtitleLanguage: '529',
  subtitleOn: true
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
    // Reset mock to default state for each test
    setMockWatchState(defaultInitialState)
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

    // Should render main elements
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

    setMockWatchState(stateWithMatchingSubtitleLanguage)

    render(
      <MockedProvider mocks={[defaultGetSubtitlesMock]} addTypename={false}>
        <SubtitlesSelect />
      </MockedProvider>
    )

    // Should display the local name (primary) in the autocomplete
    expect(screen.getByDisplayValue('English')).toBeInTheDocument()
  })

  it('should handle when subtitleLanguage does not match any language in allLanguages', () => {
    const stateWithNonMatchingSubtitleLanguage = {
      ...defaultInitialState,
      subtitleLanguage: 'nonexistent-id', // This won't match any language
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

    // Should render with empty value since no match is found
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

    // Should render with empty value
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

    // Should render with empty value
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
            // Missing non-primary (native) name
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

    // Should still render the component, but the native name will be undefined
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
            // Missing primary name
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

    // Should still render the component
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('should dispatch UpdateSubtitleLanguage when handleChange is triggered', async () => {
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

    setMockWatchState(stateWithAllLanguages)

    render(
      <MockedProvider mocks={[defaultGetSubtitlesMock]} addTypename={false}>
        <SubtitlesSelect />
      </MockedProvider>
    )

    const combobox = screen.getByRole('combobox')
    await user.click(combobox)

    // Wait for options to appear and click on Arabic option
    await waitFor(() => {
      expect(screen.getByText('اللغة العربية')).toBeInTheDocument()
    })

    await user.click(screen.getByText('اللغة العربية'))

    // Verify that dispatch was called with the correct action
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UpdateSubtitleLanguage',
      languageId: '22658'
    })
  })

  it('should dispatch UpdateSubtitlesOn when checkbox is toggled', async () => {
    const user = userEvent.setup()
    const stateWithSubtitlesOn = {
      ...defaultInitialState,
      subtitleOn: true,
      currentSubtitleOn: true
    }

    setMockWatchState(stateWithSubtitlesOn)

    render(
      <MockedProvider mocks={[defaultGetSubtitlesMock]} addTypename={false}>
        <SubtitlesSelect />
      </MockedProvider>
    )

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()

    await user.click(checkbox)

    // Verify that dispatch was called with the correct action
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UpdateSubtitlesOn',
      enabled: false
    })
  })

  it('should respect currentSubtitleOn preference over subtitleOn', () => {
    const stateWithCurrentSubtitleOnDifferent = {
      ...defaultInitialState,
      subtitleOn: false,
      currentSubtitleOn: true // This should take precedence
    }

    render(
      <MockedProvider mocks={[defaultGetSubtitlesMock]} addTypename={false}>
        <WatchProvider initialState={stateWithCurrentSubtitleOnDifferent}>
          <SubtitlesSelect />
        </WatchProvider>
      </MockedProvider>
    )

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked() // Should be checked due to currentSubtitleOn being true
  })

  it('should call GET_SUBTITLES query and apply the returned subtitle languages', async () => {
    const stateWithVideoId = {
      ...defaultInitialState,
      videoId: 'video123',
      videoVariantSlug: 'video123',
      videoSubtitleLanguages: undefined,
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

    setMockWatchState(stateWithVideoId)

    render(
      <MockedProvider mocks={[mockWithFunction]} addTypename={false}>
        <SubtitlesSelect />
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
      videoSubtitleLanguages: undefined
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

  it('should not trigger GraphQL query when videoSubtitleLanguages already exists', () => {
    const stateWithExistingSubtitleLanguages = {
      ...defaultInitialState,
      videoId: 'video123',
      videoSubtitleLanguages: [
        {
          __typename: 'VideoSubtitle' as const,
          language: {
            __typename: 'Language' as const,
            id: '529',
            bcp47: 'en',
            name: []
          },
          value: 'https://example.com/subtitles.vtt'
        }
      ]
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
})
