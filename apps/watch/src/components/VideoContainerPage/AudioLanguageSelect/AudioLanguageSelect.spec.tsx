import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { GetLanguagesSlug } from '../../../../__generated__/GetLanguagesSlug'
import { VideoProvider } from '../../../libs/videoContext'
import { videos } from '../../Videos/__generated__/testData'

import { AudioLanguageSelect } from './AudioLanguageSelect'
import { GET_LANGUAGES_SLUG } from '../../../libs/useLanguagesSlugQuery'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, any>) => {
      if (key === '{{ languageCount }} Languages') {
        return `${params?.languageCount} Languages`
      }
      return key
    }
  })
}))

describe('AudioLanguageSelect', () => {
  const mockVideo = videos[0]
  const mockContainer = videos.find(({ id }) => id === 'LUMOCollection')

  const getLanguagesSlugMock: MockedResponse<GetLanguagesSlug> = {
    request: {
      query: GET_LANGUAGES_SLUG,
      variables: {
        id: mockVideo.id
      }
    },
    result: {
      data: {
        video: {
          __typename: 'Video',
          variantLanguagesWithSlug: [
            {
              __typename: 'LanguageWithSlug',
              slug: 'jesus/english',
              language: {
                id: '529',
                slug: 'english',
                __typename: 'Language',
                name: [
                  {
                    value: 'English',
                    primary: true,
                    __typename: 'LanguageName'
                  }
                ]
              }
            },
            {
              __typename: 'LanguageWithSlug',
              slug: 'jesus/spanish',
              language: {
                id: '496',
                slug: 'spanish',
                __typename: 'Language',
                name: [
                  {
                    value: 'Spanish',
                    primary: true,
                    __typename: 'LanguageName'
                  },
                  {
                    value: 'Español',
                    primary: false,
                    __typename: 'LanguageName'
                  }
                ]
              }
            },
            {
              __typename: 'LanguageWithSlug',
              slug: 'jesus/french',
              language: {
                id: '497',
                slug: 'french',
                __typename: 'Language',
                name: [
                  {
                    value: 'French',
                    primary: true,
                    __typename: 'LanguageName'
                  },
                  {
                    value: 'Français',
                    primary: false,
                    __typename: 'LanguageName'
                  }
                ]
              }
            }
          ]
        }
      }
    }
  }

  const defaultProps = {
    content: mockVideo,
    container: mockContainer
  }
  const originalPointerEvent = window.PointerEvent

  // Store original HTMLElement prototype methods
  const originalHTMLElementMethods = {
    scrollIntoView: window.HTMLElement.prototype.scrollIntoView,
    releasePointerCapture: window.HTMLElement.prototype.releasePointerCapture,
    hasPointerCapture: window.HTMLElement.prototype.hasPointerCapture
  }

  // Mock PointerEvent and HTMLElement methods for shadcn/ui Select component testing
  // https://stackoverflow.com/questions/78975098/testing-shadcn-select-with-jest-and-react-testing-library | https://github.com/shadcn-ui/ui/discussions/4168#discussioncomment-10502077
  function createMockPointerEvent(
    type: string,
    props: PointerEventInit = {}
  ): PointerEvent {
    const event = new Event(type, props) as PointerEvent
    Object.assign(event, {
      button: props.button ?? 0,
      ctrlKey: props.ctrlKey ?? false,
      pointerType: props.pointerType ?? 'mouse'
    })
    return event
  }

  beforeEach(() => {
    // Mock PointerEvent globally - needed for shadcn/ui Select component testing
    // https://stackoverflow.com/questions/78975098/testing-shadcn-select-with-jest-and-react-testing-library | https://github.com/shadcn-ui/ui/discussions/4168#discussioncomment-10502077
    Object.defineProperty(window, 'PointerEvent', {
      writable: true,
      value: createMockPointerEvent as any
    })

    // Mock HTMLElement methods globally - needed for shadcn/ui Select component testing
    // https://stackoverflow.com/questions/78975098/testing-shadcn-select-with-jest-and-react-testing-library | https://github.com/shadcn-ui/ui/discussions/4168#discussioncomment-10502077
    Object.assign(window.HTMLElement.prototype, {
      scrollIntoView: jest.fn(),
      releasePointerCapture: jest.fn(),
      hasPointerCapture: jest.fn()
    })
    jest.clearAllMocks()
  })

  afterEach(() => {
    // Restore original HTMLElement prototype methods
    Object.assign(window.HTMLElement.prototype, originalHTMLElementMethods)
    Object.defineProperty(window, 'PointerEvent', {
      writable: true,
      value: originalPointerEvent
    })
  })

  it('should render the language selector with current language', async () => {
    const result = jest.fn().mockReturnValue({ ...getLanguagesSlugMock.result })

    const { getByTestId, getByText } = render(
      <MockedProvider mocks={[{ ...getLanguagesSlugMock, result }]}>
        <VideoProvider value={defaultProps}>
          <AudioLanguageSelect />
        </VideoProvider>
      </MockedProvider>
    )

    fireEvent.mouseEnter(getByTestId('AudioLanguageSelectTrigger'))
    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(getByTestId('LanguageOutlinedIcon')).toBeInTheDocument()
      expect(getByText('English')).toBeInTheDocument()
      expect(getByText('2205 Languages')).toBeInTheDocument()
      expect(getByTestId('KeyboardArrowDownOutlinedIcon')).toBeInTheDocument()
    })
  })

  it('should generate correct href with container slug', async () => {
    const result = jest.fn().mockReturnValue({ ...getLanguagesSlugMock.result })

    const { getAllByRole, getByTestId } = render(
      <MockedProvider mocks={[{ ...getLanguagesSlugMock, result }]}>
        <VideoProvider value={{ content: mockVideo, container: mockContainer }}>
          <AudioLanguageSelect />
        </VideoProvider>
      </MockedProvider>
    )

    fireEvent.mouseEnter(getByTestId('AudioLanguageSelectTrigger'))

    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })

    fireEvent.click(getByTestId('AudioLanguageSelectTrigger'))

    await waitFor(() => {
      const languageLinks = getAllByRole('link')
      expect(languageLinks[0]).toHaveAttribute(
        'href',
        '/watch/lumo/jesus/english'
      )
      expect(languageLinks[1]).toHaveAttribute(
        'href',
        '/watch/lumo/jesus/spanish'
      )
      expect(languageLinks[2]).toHaveAttribute(
        'href',
        '/watch/lumo/jesus/french'
      )
    })
  })

  it('should handle English language display correctly', async () => {
    const englishMock = {
      ...getLanguagesSlugMock,
      result: {
        data: {
          video: {
            variantLanguagesWithSlug: [
              {
                __typename: 'LanguageWithSlug',
                slug: 'jesus/english',
                language: {
                  id: '529',
                  slug: 'english',
                  __typename: 'Language',
                  name: [
                    {
                      value: 'English',
                      primary: true,
                      __typename: 'LanguageName'
                    }
                  ]
                }
              }
            ]
          }
        }
      }
    }

    const result = jest.fn().mockReturnValue({ ...englishMock.result })

    const { getByText, getByTestId } = render(
      <MockedProvider mocks={[{ ...englishMock, result }]}>
        <VideoProvider value={defaultProps}>
          <AudioLanguageSelect />
        </VideoProvider>
      </MockedProvider>
    )

    fireEvent.mouseEnter(getByTestId('AudioLanguageSelectTrigger'))

    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })

    fireEvent.click(getByTestId('AudioLanguageSelectTrigger'))

    await waitFor(() => {
      expect(
        getByTestId('AudioLanguageSelectPrimaryLanguageName').textContent
      ).toBe('(English)')
      expect(
        getByTestId('AudioLanguageSelectNonPrimaryLanguageName').textContent
      ).toBe('English')
    })
  })

  it('should handle non-English languages with both names', async () => {
    const spanishMock = {
      ...getLanguagesSlugMock,
      result: {
        data: {
          video: {
            variantLanguagesWithSlug: [
              {
                __typename: 'LanguageWithSlug',
                slug: 'jesus/spanish',
                language: {
                  id: '496',
                  slug: 'spanish',
                  __typename: 'Language',
                  name: [
                    {
                      value: 'Spanish',
                      primary: false,
                      __typename: 'LanguageName'
                    },
                    {
                      value: 'Español',
                      primary: true,
                      __typename: 'LanguageName'
                    }
                  ]
                }
              }
            ]
          }
        }
      }
    }

    const result = jest.fn().mockReturnValue({ ...spanishMock.result })

    const { getByTestId } = render(
      <MockedProvider mocks={[{ ...spanishMock, result }]}>
        <VideoProvider value={defaultProps}>
          <AudioLanguageSelect />
        </VideoProvider>
      </MockedProvider>
    )

    fireEvent.mouseEnter(getByTestId('AudioLanguageSelectTrigger'))

    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })

    fireEvent.click(getByTestId('AudioLanguageSelectTrigger'))

    await waitFor(() => {
      expect(
        getByTestId('AudioLanguageSelectPrimaryLanguageName').textContent
      ).toBe('(Español)')
      expect(
        getByTestId('AudioLanguageSelectNonPrimaryLanguageName').textContent
      ).toBe('Spanish')
    })
  })
})
