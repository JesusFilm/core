import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { GetLanguagesSlug } from '../../../../../__generated__/GetLanguagesSlug'
import { VideoProvider } from '../../../../libs/videoContext'
import { GET_LANGUAGES_SLUG } from '../../../AudioLanguageDialog'
import { Select, SelectTrigger } from '../../../Select'
import { videos } from '../../../Videos/__generated__/testData'

import { AudoLanguageSelectContent } from './AudoLanguageSelectContent'

describe('AudoLanguageSelectContent', () => {
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

  it('should render language options with correct links', async () => {
    const result = jest.fn().mockReturnValue({ ...getLanguagesSlugMock.result })

    const { getAllByRole, getByTestId } = render(
      <MockedProvider mocks={[{ ...getLanguagesSlugMock, result }]}>
        <VideoProvider value={defaultProps}>
          <Select>
            <SelectTrigger data-testid="TestSelectTrigger">
              {'Test Select Trigger'}
            </SelectTrigger>
            <AudoLanguageSelectContent />
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

    const { getByTestId, queryByTestId } = render(
      <MockedProvider mocks={[{ ...englishMock, result }]}>
        <VideoProvider value={defaultProps}>
          <Select>
            <SelectTrigger data-testid="TestSelectTrigger">
              {'Test Select Trigger'}
            </SelectTrigger>
            <AudoLanguageSelectContent />
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
            <AudoLanguageSelectContent />
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
            <AudoLanguageSelectContent />
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
