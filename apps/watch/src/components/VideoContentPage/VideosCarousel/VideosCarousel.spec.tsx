import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import { videos } from '../../VideosPage/testData'
import { GET_VIDEOS } from '../../VideosPage/VideosPage'
import { VideosCarousel } from './VideosCarousel'

describe('carousel', () => {
  it('should render a carousel', async () => {
    const { getByTestId } = render(
      <MockedProvider>
        <VideosCarousel videos={[]} />
      </MockedProvider>
    )
    expect(getByTestId('videos-carousel')).toBeInTheDocument()
  })
  // skip this test becuase the carousel doesn't render properly in jest
  xit('should display videos', async () => {
    const { getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_VIDEOS,
              variables: {
                where: {
                  availableVariantLanguageIds: ['529']
                },
                page: 1,
                limit: 8,
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
        <VideosCarousel videos={videos} />
      </MockedProvider>
    )
    await waitFor(() => {
      expect(getByText(videos[0].title[0].value)).toBeInTheDocument()
      expect(getByText(videos[7].title[0].value)).toBeInTheDocument()
    })
  })
})
