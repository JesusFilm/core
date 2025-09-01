import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { GetLanguagesSlug } from '../../../../../__generated__/GetLanguagesSlug'
import { GET_LANGUAGES_SLUG } from '../../../../libs/useLanguagesSlugQuery'
import { VideoProvider } from '../../../../libs/videoContext'
import { Select, SelectTrigger } from '../../../Select'
import { videos } from '../../../Videos/__generated__/testData'

import { AudioLanguageSelectContent } from './AudioLanguageSelectContent'

describe('AudioLanguageSelectContent', () => {
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
                    primary: false,
                    __typename: 'LanguageName'
                  },
                  {
                    value: 'Français',
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

  it('should render language options with correct links', async () => {
    const result = jest.fn().mockReturnValue({ ...getLanguagesSlugMock.result })

    const { getAllByRole, getByTestId } = render(
      <MockedProvider mocks={[{ ...getLanguagesSlugMock, result }]}>
        <VideoProvider value={defaultProps}>
          <Select>
            <SelectTrigger data-testid="TestSelectTrigger">
              {'Test Select Trigger'}
            </SelectTrigger>
            <AudioLanguageSelectContent />
          </Select>
        </VideoProvider>
      </MockedProvider>
    )

    fireEvent.click(getByTestId('TestSelectTrigger'))

    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })

    await waitFor(() => {
      const languageLinks = getAllByRole('link')
      expect(languageLinks).toHaveLength(3)
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

  it('should show english primary label name  as non primary language name', async () => {
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

    const { getByTestId } = render(
      <MockedProvider mocks={[{ ...englishMock, result }]}>
        <VideoProvider value={defaultProps}>
          <Select>
            <SelectTrigger data-testid="TestSelectTrigger">
              {'Test Select Trigger'}
            </SelectTrigger>
            <AudioLanguageSelectContent />
          </Select>
        </VideoProvider>
      </MockedProvider>
    )

    fireEvent.click(getByTestId('TestSelectTrigger'))

    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(
        getByTestId('AudioLanguageSelectNonPrimaryLanguageName')
      ).toHaveTextContent('English')
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
          <Select>
            <SelectTrigger data-testid="TestSelectTrigger">
              {'Test Select Trigger'}
            </SelectTrigger>
            <AudioLanguageSelectContent />
          </Select>
        </VideoProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('TestSelectTrigger'))

    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(
        getByTestId('AudioLanguageSelectNonPrimaryLanguageName')
      ).toHaveTextContent('Spanish')
      expect(
        getByTestId('AudioLanguageSelectPrimaryLanguageName')
      ).toHaveTextContent('(Español)')
    })
  })

  it('should handle missing language slug', async () => {
    const noSlugMock = {
      ...getLanguagesSlugMock,
      result: {
        data: {
          video: {
            variantLanguagesWithSlug: [
              {
                __typename: 'LanguageWithSlug',
                slug: null,
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

    const result = jest.fn().mockReturnValue({ ...noSlugMock.result })

    const { getAllByRole, getByTestId } = render(
      <MockedProvider mocks={[{ ...noSlugMock, result }]}>
        <VideoProvider value={defaultProps}>
          <Select>
            <SelectTrigger data-testid="TestSelectTrigger">
              {'Test Select Trigger'}
            </SelectTrigger>
            <AudioLanguageSelectContent />
          </Select>
        </VideoProvider>
      </MockedProvider>
    )

    fireEvent.click(getByTestId('TestSelectTrigger'))

    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })

    await waitFor(() => {
      const languageLinks = getAllByRole('link')
      expect(languageLinks[0]).toHaveAttribute('href', '#')
    })
  })
})
