// Note: some Carousel tests are missing currently due to an inability to mock the Carousel component.

import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor, within } from '@testing-library/react'

import { videos } from '../Videos/testData'
import { languages } from './testData'
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
    it('should add language filter', async () => {
      const result = jest.fn()
      const location = {
        ...window.location,
        search: '?al=529'
      }
      Object.defineProperty(window, 'location', {
        writable: true,
        value: location
      })
      const { getByText } = render(
        <MockedProvider
          mocks={[
            {
              request: {
                query: GET_LANGUAGES,
                variables: {
                  languageId: '529'
                }
              },
              result: {
                data: {
                  languages
                }
              }
            },
            {
              request: {
                query: GET_VIDEOS,
                variables: {
                  where: { availableVariantLanguageIds: ['529'] },
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

      // const textbox = getAllByRole('textbox')[0]
      // await waitFor(() => fireEvent.focus(textbox))
      // await waitFor(() => fireEvent.keyDown(textbox, { key: 'ArrowDown' }))
      // const option = getAllByRole('option')[0]
      // fireEvent.click(option)
      // console.log(textbox.value)
      await waitFor(() =>
        expect(getByText(videos[0].title[0].value)).toBeInTheDocument()
      )
      // await waitFor(() => expect(result).toHaveBeenCalled())
    })
  })
})
