import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import { videos } from '../../../pages'
import { GET_VIDEOS } from '../Videos/Videos'

import { HomeVideos } from './HomeVideos'
import { data } from './testData'

describe('HomeVideos', () => {
  describe('grid', () => {
    it('should render a grid', () => {
      const { getByTestId } = render(
        <MockedProvider>
          <HomeVideos videos={videos} data={data} />
        </MockedProvider>
      )
      expect(getByTestId('video-list-grid')).toBeInTheDocument()
    })
    it('should display videos', async () => {
      const { getByText } = render(
        <MockedProvider
          mocks={[
            {
              request: {
                query: GET_VIDEOS,
                variables: {
                  where: {
                    ids: ['1', '2', '3', '4', '5', '6', '7', '8']
                  },
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
          <HomeVideos videos={videos} data={data} />
        </MockedProvider>
      )
      await waitFor(() => {
        expect(getByText(data[0].title[0].value)).toBeInTheDocument()
        expect(getByText(data[6].title[0].value)).toBeInTheDocument()
      })
    })
  })
})
