import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { GetLanguagesSlug } from '../../../../__generated__/GetLanguagesSlug'
import { VideoProvider } from '../../../libs/videoContext'
import { GET_LANGUAGES_SLUG } from '../../AudioLanguageDialog'
import { videos } from '../../Videos/__generated__/testData'

import { AudioLanguageSelect } from './AudioLanguageSelect'

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

  beforeEach(() => {
    jest.clearAllMocks()
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
