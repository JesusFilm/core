import { MockedProvider } from '@apollo/client/testing'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { VideoProvider } from '../../../libs/videoContext'
import { videos } from '../../Videos/testData'
import { AudioLanguageButton, GET_VIDEO_LANGUAGES } from '.'

describe('AudioLanguageButton', () => {
  const slug = 'jesus/english'
  const mocks = [
    {
      request: {
        query: GET_VIDEO_LANGUAGES,
        variables: {
          id: slug
        }
      },
      result: {
        data: {
          video: {
            id: '1_jf-0-0',
            variant: {
              __typename: 'Language',
              name: [
                {
                  value: 'English',
                  primary: true,
                  __typename: 'Translation'
                }
              ]
            },
            variantLanguagesWithSlug: [
              {
                __typename: 'LanguageWithSlug',
                slug: 'jesus/english',
                language: {
                  id: '529',
                  __typename: 'Language',
                  name: [
                    {
                      value: 'English',
                      primary: true,
                      __typename: 'Translation'
                    }
                  ]
                }
              },
              {
                __typename: 'LanguageWithSlug',
                slug: 'jesus/french',
                language: {
                  id: '496',
                  __typename: 'Language',
                  name: [
                    {
                      value: 'Français',
                      primary: true,
                      __typename: 'Translation'
                    },
                    {
                      value: 'French',
                      primary: false,
                      __typename: 'Translation'
                    }
                  ]
                }
              },
              {
                __typename: 'LanguageWithSlug',
                slug: 'jesus/Deutsch',
                language: {
                  id: '1106',
                  __typename: 'Language',
                  name: [
                    {
                      value: 'Deutsch',
                      primary: true,
                      __typename: 'Translation'
                    },
                    {
                      value: 'German, Standard',
                      primary: false,
                      __typename: 'Translation'
                    }
                  ]
                }
              }
            ]
          }
        }
      }
    }
  ]

  it('renders audio language as a button', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider mocks={mocks}>
        <VideoProvider value={{ content: videos[0] }}>
          <AudioLanguageButton componentVariant="button" />
        </VideoProvider>
      </MockedProvider>
    )
    await waitFor(() => fireEvent.click(getByRole('button')))
    expect(getByText('3 Languages Available')).toBeInTheDocument()
  })

  it('renders audio language as an icon', async () => {
    const { getByTestId, getByText } = render(
      <MockedProvider mocks={mocks}>
        <VideoProvider value={{ content: videos[0] }}>
          <AudioLanguageButton componentVariant="icon" />
        </VideoProvider>
      </MockedProvider>
    )
    await waitFor(() => fireEvent.click(getByTestId('LanguageRoundedIcon')))
    expect(getByText('3 Languages Available')).toBeInTheDocument()
  })
})
