// Note: some Carousel tests are missing currently due to an inability to mock the Carousel component.

import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'

import { videos } from '../Videos/testData'
import { VideosPage, GET_VIDEOS, limit } from './VideosPage'

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
})
