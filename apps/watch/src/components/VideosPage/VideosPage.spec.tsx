// Note: some Carousel tests are missing currently due to an inability to mock the Carousel component.

import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { videos } from '../Videos/testData'
import { VideosPage, GET_VIDEOS, limit, GET_LANGUAGES } from './VideosPage'

describe('VideosPage', () => {
  describe('grid', () => {
    it('should render a grid', () => {
      const { getByTestId } = render(
        <MockedProvider>
          <VideosPage />
        </MockedProvider>
      )
      expect(getByTestId('videos-grid')).toBeInTheDocument()
    })
    it('should display videos', async () => {
      const { getByText } = render(
        <MockedProvider
          mocks={[
            {
              request: {
                query: GET_VIDEOS,
                variables: {
                  where: {},
                  offset: 0,
                  limit: limit,
                  languageId: '529'
                }
              },
              result: {
                data: {
                  videos: videos
                }
              }
            }
          ]}
        >
          <VideosPage />
        </MockedProvider>
      )
      await waitFor(() => {
        expect(getByText(videos[0].title[0].value)).toBeInTheDocument()
        expect(getByText(videos[7].title[0].value)).toBeInTheDocument()
      })
    })
  })

  describe('filters', () => {
    const languages = [
      {
        id: '1',
        __typename: 'Language',
        name: [
          {
            __typename: 'Translation',
            value: 'English',
            primary: true
          }
        ]
      }
    ]

    it('should add language filter', async () => {
      const result = jest.fn()
      const { getByRole } = render(
        <MockedProvider
          mocks={[
            {
              request: {
                query: GET_VIDEOS,
                variables: {
                  where: {},
                  offset: 0,
                  limit: limit,
                  languageId: '529'
                }
              },
              result: {
                data: {
                  videos: videos
                }
              }
            },
            {
              request: {
                query: GET_LANGUAGES,
                variables: {
                  languageId: '529'
                }
              },
              result: {
                data: {
                  languages: languages
                }
              }
            },
            {
              request: {
                query: GET_VIDEOS,
                variables: {
                  where: { availableVariantLanguageIds: '529' },
                  offset: 0,
                  limit: limit,
                  languageId: '529'
                }
              },
              result
            }
          ]}
        >
          <VideosPage />
        </MockedProvider>
      )

      await waitFor(() => fireEvent.focus(getByRole('textbox')))
      fireEvent.keyDown(getByRole('textbox'), { key: 'ArrowDown' })
      fireEvent.click(getByRole('option', { name: 'English' }))
      await waitFor(() => expect(result).toHaveBeenCalled())
    })
  })
})
