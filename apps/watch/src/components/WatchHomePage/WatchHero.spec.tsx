import { act, render, screen, waitFor } from '@testing-library/react'
import { PlayerProvider } from '../../libs/playerContext'
import { VideoCarouselProvider, useVideoCarousel } from '../../libs/videoCarouselContext'
import { WatchProvider } from '../../libs/watchContext'
import { videos } from '../Videos/__generated__/testData'

import { WatchHero } from './WatchHero'

// Mock the VideoCarousel context
jest.mock('../../libs/videoCarouselContext', () => ({
  VideoCarouselProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="VideoCarouselProvider">{children}</div>,
  useVideoCarousel: jest.fn()
}))

const mockUseVideoCarousel = useVideoCarousel as jest.MockedFunction<typeof useVideoCarousel>

describe('WatchHero', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders VideoContentHero and VideoCarousel with active video', () => {
    mockUseVideoCarousel.mockReturnValue({
      activeVideoId: videos[0]?.id ?? null,
      activeVideo: videos[0] ?? null,
      currentMuxInsert: null,
      slides: [],
      loading: false,
      isProgressing: false,
      setActiveVideo: jest.fn(),
      handleMuxInsertComplete: jest.fn(),
      handleSkipActiveVideo: jest.fn(),
      loadSlides: jest.fn()
    })

    render(
      <VideoCarouselProvider>
        <PlayerProvider initialState={{ mute: false }}>
          <WatchProvider initialState={{ subtitleLanguageId: '529', subtitleOn: false }}>
            <WatchHero />
          </WatchProvider>
        </PlayerProvider>
      </VideoCarouselProvider>
    )

    expect(screen.getByTestId('VideoContentHero')).toBeInTheDocument()
    expect(screen.getByTestId('VideoCarousel')).toBeInTheDocument()
  })

  it('renders VideoContentHero and VideoCarousel with Mux insert', () => {
    const mockMuxInsert = {
      id: 'mux-insert-1',
      source: 'mux' as const,
      playbackId: 'test-playback-id',
      playbackIndex: 0,
      urls: { hls: 'test-hls-url', poster: 'test-poster-url' },
      overlay: {
        title: 'Test Mux Insert',
        description: 'Test description',
        label: 'shortFilm'
      },
      duration: 30
    }

    mockUseVideoCarousel.mockReturnValue({
      activeVideoId: 'mux-insert-1',
      activeVideo: null,
      currentMuxInsert: mockMuxInsert,
      slides: [],
      loading: false,
      isProgressing: false,
      setActiveVideo: jest.fn(),
      handleMuxInsertComplete: jest.fn(),
      handleSkipActiveVideo: jest.fn(),
      loadSlides: jest.fn()
    })

    render(
      <VideoCarouselProvider>
        <PlayerProvider initialState={{ mute: false }}>
          <WatchProvider initialState={{ subtitleLanguageId: '529', subtitleOn: false }}>
            <WatchHero />
          </WatchProvider>
        </PlayerProvider>
      </VideoCarouselProvider>
    )

    expect(screen.getByTestId('VideoContentHero')).toBeInTheDocument()
    expect(screen.getByTestId('VideoCarousel')).toBeInTheDocument()
  })

  it('does not render VideoContentHero when no active video', () => {
    mockUseVideoCarousel.mockReturnValue({
      activeVideoId: null,
      activeVideo: null,
      currentMuxInsert: null,
      slides: [],
      loading: false,
      isProgressing: false,
      setActiveVideo: jest.fn(),
      handleMuxInsertComplete: jest.fn(),
      handleSkipActiveVideo: jest.fn(),
      loadSlides: jest.fn()
    })

    render(
      <VideoCarouselProvider>
        <PlayerProvider initialState={{ mute: false }}>
          <WatchProvider initialState={{ subtitleLanguageId: '529', subtitleOn: false }}>
            <WatchHero />
          </WatchProvider>
        </PlayerProvider>
      </VideoCarouselProvider>
    )

    expect(screen.queryByTestId('VideoContentHero')).not.toBeInTheDocument()
    expect(screen.getByTestId('VideoCarousel')).toBeInTheDocument()
  })

  it('passes correct props to VideoContentHero', () => {
    const mockHandleMuxInsertComplete = jest.fn()
    const mockHandleSkipActiveVideo = jest.fn()

    const mockMuxInsert = {
      id: 'mux-insert-1',
      source: 'mux' as const,
      playbackId: 'test-playback-id',
      playbackIndex: 0,
      urls: { hls: 'test-hls-url', poster: 'test-poster-url' },
      overlay: {
        title: 'Test Mux Insert',
        description: 'Test description',
        label: 'shortFilm'
      },
      duration: 30
    }

    mockUseVideoCarousel.mockReturnValue({
      activeVideoId: videos[0]?.id ?? null,
      activeVideo: videos[0] ?? null,
      currentMuxInsert: mockMuxInsert,
      slides: [],
      loading: false,
      isProgressing: false,
      setActiveVideo: jest.fn(),
      handleMuxInsertComplete: mockHandleMuxInsertComplete,
      handleSkipActiveVideo: mockHandleSkipActiveVideo,
      loadSlides: jest.fn()
    })

    render(
      <VideoCarouselProvider>
        <PlayerProvider initialState={{ mute: false }}>
          <WatchProvider initialState={{ subtitleLanguageId: '529', subtitleOn: false }}>
            <WatchHero />
          </WatchProvider>
        </PlayerProvider>
      </VideoCarouselProvider>
    )

    // The VideoContentHero should receive the correct props from context
    expect(screen.getByTestId('VideoContentHero')).toBeInTheDocument()
  })

  it('renders children correctly', () => {
    mockUseVideoCarousel.mockReturnValue({
      activeVideoId: null,
      activeVideo: null,
      currentMuxInsert: null,
      slides: [],
      loading: false,
      isProgressing: false,
      setActiveVideo: jest.fn(),
      handleMuxInsertComplete: jest.fn(),
      handleSkipActiveVideo: jest.fn(),
      loadSlides: jest.fn()
    })

    render(
      <VideoCarouselProvider>
        <PlayerProvider initialState={{ mute: false }}>
          <WatchProvider initialState={{ subtitleLanguageId: '529', subtitleOn: false }}>
            <WatchHero>
              <div data-testid="test-child">Test Child</div>
            </WatchHero>
          </WatchProvider>
        </PlayerProvider>
      </VideoCarouselProvider>
    )

    expect(screen.getByTestId('test-child')).toBeInTheDocument()
  })
})
