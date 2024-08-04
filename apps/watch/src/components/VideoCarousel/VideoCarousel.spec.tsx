import { render, waitFor } from '@testing-library/react'

import {
  type CoreVideo,
  useAlgoliaVideos
} from '../../libs/algolia/useAlgoliaVideos'
import { videos } from '../Videos/__generated__/testData'

import { VideoCarousel } from './VideoCarousel'

jest.mock('../../libs/algolia/useAlgoliaVideos')

const mockedUseAlgoliaVideos = useAlgoliaVideos as jest.MockedFunction<
  typeof useAlgoliaVideos
>

describe('VideosCarousel', () => {
  const transformedVideos = [
    {
      __typename: 'Video',
      childrenCount: 49,
      id: 'videoId',
      image:
        'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ-0-0.mobileCinematicHigh.jpg',
      imageAlt: [
        {
          value: 'Life of Jesus (Gospel of John)'
        }
      ],
      label: 'featureFilm',
      slug: 'video-slug/english',
      snippet: [],
      title: [
        {
          value: 'title1'
        }
      ],
      variant: {
        duration: 10994,
        hls: null,
        id: '2_529-GOJ-0-0',
        slug: 'video-slug/english'
      }
    }
  ] as unknown as CoreVideo[]

  beforeEach(() => {
    mockedUseAlgoliaVideos.mockReturnValue({
      loading: false,
      noResults: false,
      hits: transformedVideos,
      showMore: jest.fn(),
      isLastPage: false,
      sendEvent: jest.fn()
    })
  })

  it('should display video items', async () => {
    const { getByRole, getByText } = render(
      <VideoCarousel activeVideoId={videos[0].id} videos={videos} />
    )

    await waitFor(() => expect(getByText('Playing now')).toBeInTheDocument())
    expect(getByRole('heading', { name: 'JESUS' })).toBeInTheDocument()
  })
})
