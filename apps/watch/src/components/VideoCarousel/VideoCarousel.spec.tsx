import { render, screen, waitFor } from '@testing-library/react'

import { useAlgoliaVideos } from '@core/journeys/ui/algolia/useAlgoliaVideos'

import { type CoreVideo } from '../../libs/algolia/transformAlgoliaVideos'
import { videos } from '../Videos/__generated__/testData'

import { VideoCarousel } from './VideoCarousel'

class MockIntersectionObserver {
  callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  observe(): void {
    this.callback([], this as unknown as IntersectionObserver)
  }

  disconnect(): void {}

  unobserve(): void {}
}

jest.mock('@core/journeys/ui/algolia/useAlgoliaVideos')

const mockedUseAlgoliaVideos = useAlgoliaVideos as jest.MockedFunction<
  typeof useAlgoliaVideos
>

describe('VideosCarousel', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      configurable: true,
      value: MockIntersectionObserver
    })

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: false,
        media: '(prefers-reduced-motion: no-preference)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        dispatchEvent: jest.fn()
      }))
    })

    Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
      writable: true,
      configurable: true,
      value: jest.fn().mockResolvedValue(undefined)
    })

    Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
      writable: true,
      configurable: true,
      value: jest.fn()
    })
  })

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
      items: transformedVideos,
      showMore: jest.fn(),
      isLastPage: false,
      sendEvent: jest.fn()
    })
  })

  it('should display video items', async () => {
    const { getByRole } = render(
      <VideoCarousel activeVideoId={videos[0].id} videos={videos} />
    )

    expect(getByRole('heading', { name: 'JESUS' })).toBeInTheDocument()
  })

  it('renders MUX insert slides when provided', () => {
    const muxSlides = [
      {
        source: 'mux' as const,
        id: 'welcome-start',
        overlay: {
          label: 'Today’s Pick',
          title: 'Morning Nature Background',
          collection: 'Daily Inspirations',
          description: 'A calm intro before your playlist.'
        },
        playbackId: 'abc123',
        playbackIndex: 0,
        urls: {
          hls: 'https://stream.mux.com/abc123.m3u8',
          poster: 'https://image.mux.com/abc123/thumbnail.jpg?time=1',
          mp4: {}
        }
      }
    ]

    render(<VideoCarousel slides={muxSlides} />)

    expect(screen.getByTestId('VideoCard-welcome-start')).toBeInTheDocument()
    expect(screen.getByText('Morning Nature Background')).toBeInTheDocument()
  })
})
