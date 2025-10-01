import { act, render, screen, waitFor } from '@testing-library/react'
import { PlayerProvider } from '../playerContext'
import { VideoCarouselProvider, useVideoCarousel } from './VideoCarouselContext'

// Mock the useCarouselVideos hook
jest.mock('../components/VideoHero/libs/useCarouselVideos', () => ({
  useCarouselVideos: jest.fn(() => ({
    slides: [
      {
        source: 'video' as const,
        id: 'video-1',
        video: {
          id: 'video-1',
          title: [{ value: 'Test Video 1' }],
          variant: {
            duration: 120,
            hls: 'test-hls-1',
            slug: 'test-video-1'
          }
        }
      },
      {
        source: 'video' as const,
        id: 'video-2',
        video: {
          id: 'video-2',
          title: [{ value: 'Test Video 2' }],
          variant: {
            duration: 100,
            hls: 'test-hls-2',
            slug: 'test-video-2'
          }
        }
      }
    ],
    loading: false,
    moveToNext: jest.fn(),
    jumpToVideo: jest.fn()
  })),
  mergeMuxInserts: jest.fn((videos) => videos.map(video => ({
    source: 'video' as const,
    id: video.id,
    video
  })))
}))

// Mock the useVideoChildren hook
jest.mock('../useVideoChildren', () => ({
  useVideoChildren: jest.fn(() => ({
    children: [
      {
        id: 'child-1',
        title: [{ value: 'Child Video 1' }],
        variant: {
          duration: 90,
          hls: 'child-hls-1',
          slug: 'child-video-1'
        }
      },
      {
        id: 'child-2',
        title: [{ value: 'Child Video 2' }],
        variant: {
          duration: 80,
          hls: 'child-hls-2',
          slug: 'child-video-2'
        }
      }
    ],
    loading: false
  }))
}))

// Mock the usePlayer hook
jest.mock('../playerContext', () => ({
  usePlayer: jest.fn(() => ({
    state: {
      progress: 90,
      durationSeconds: 120
    },
    dispatch: jest.fn()
  })),
  PlayerProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="PlayerProvider">{children}</div>
}))

const TestComponent = () => {
  const { activeVideoId, currentMuxInsert, handleMuxInsertComplete, handleSkipActiveVideo } = useVideoCarousel()

  return (
    <div>
      <div data-testid="active-video-id">{activeVideoId || 'null'}</div>
      <div data-testid="mux-insert">{currentMuxInsert ? 'present' : 'null'}</div>
      <button data-testid="mux-complete" onClick={handleMuxInsertComplete}>
        Mux Complete
      </button>
      <button data-testid="skip-video" onClick={handleSkipActiveVideo}>
        Skip Video
      </button>
    </div>
  )
}

describe('VideoCarouselProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('provides initial state correctly', () => {
    render(
      <VideoCarouselProvider>
        <TestComponent />
      </VideoCarouselProvider>
    )

    expect(screen.getByTestId('active-video-id')).toHaveTextContent('video-1')
    expect(screen.getByTestId('mux-insert')).toHaveTextContent('null')
  })

  it('handles Mux insert completion', () => {
    const mockMoveToNext = jest.fn()
    const mockUseCarouselVideos = require('../components/VideoHero/libs/useCarouselVideos').useCarouselVideos
    mockUseCarouselVideos.mockReturnValue({
      slides: [
        {
          source: 'mux' as const,
          id: 'mux-1',
          playbackId: 'test-playback',
          playbackIndex: 0,
          urls: { hls: 'test-hls', poster: 'test-poster' },
          overlay: {
            title: 'Test Mux Insert',
            description: 'Test description',
            label: 'shortFilm'
          },
          duration: 30
        },
        {
          source: 'video' as const,
          id: 'video-1',
          video: {
            id: 'video-1',
            title: [{ value: 'Test Video 1' }],
            variant: {
              duration: 120,
              hls: 'test-hls-1',
              slug: 'test-video-1'
            }
          }
        }
      ],
      loading: false,
      moveToNext: mockMoveToNext,
      jumpToVideo: jest.fn()
    })

    render(
      <VideoCarouselProvider>
        <TestComponent />
      </VideoCarouselProvider>
    )

    expect(screen.getByTestId('active-video-id')).toHaveTextContent('mux-1')
    expect(screen.getByTestId('mux-insert')).toHaveTextContent('present')

    // Click the Mux complete button
    act(() => {
      screen.getByTestId('mux-complete').click()
    })

    // Should call moveToNext for progression
    expect(mockMoveToNext).toHaveBeenCalled()
  })

  it('handles video skip functionality', () => {
    const mockMoveToNext = jest.fn()
    const mockUseCarouselVideos = require('../components/VideoHero/libs/useCarouselVideos').useCarouselVideos
    mockUseCarouselVideos.mockReturnValue({
      slides: [
        {
          source: 'video' as const,
          id: 'video-1',
          video: {
            id: 'video-1',
            title: [{ value: 'Test Video 1' }],
            variant: {
              duration: 120,
              hls: 'test-hls-1',
              slug: 'test-video-1'
            }
          }
        },
        {
          source: 'video' as const,
          id: 'video-2',
          video: {
            id: 'video-2',
            title: [{ value: 'Test Video 2' }],
            variant: {
              duration: 100,
              hls: 'test-hls-2',
              slug: 'test-video-2'
            }
          }
        }
      ],
      loading: false,
      moveToNext: mockMoveToNext,
      jumpToVideo: jest.fn()
    })

    render(
      <VideoCarouselProvider>
        <TestComponent />
      </VideoCarouselProvider>
    )

    expect(screen.getByTestId('active-video-id')).toHaveTextContent('video-1')

    // Click the skip button
    act(() => {
      screen.getByTestId('skip-video').click()
    })

    // Should call moveToNext for progression
    expect(mockMoveToNext).toHaveBeenCalled()
  })

  it('provides all required context methods', () => {
    render(
      <VideoCarouselProvider>
        <TestComponent />
      </VideoCarouselProvider>
    )

    // Should have access to all context methods without throwing
    expect(screen.getByTestId('mux-complete')).toBeInTheDocument()
    expect(screen.getByTestId('skip-video')).toBeInTheDocument()
  })

  it('uses collection-based data fetching when containerSlug and languageId are provided', async () => {
    const mockUseVideoChildren = require('../useVideoChildren').useVideoChildren

    render(
      <VideoCarouselProvider
        containerSlug="test-collection"
        languageId="en"
        initialActiveVideoId="child-1"
      >
        <TestComponent />
      </VideoCarouselProvider>
    )

    // Should call useVideoChildren with the provided parameters
    expect(mockUseVideoChildren).toHaveBeenCalledWith('test-collection', 'en')

    // Wait for the provider to render with data
    await waitFor(() => {
      expect(screen.getByTestId('active-video-id')).toBeInTheDocument()
    })
  })

  it('maintains backward compatibility with videos prop', () => {
    const mockUseCarouselVideos = require('../components/VideoHero/libs/useCarouselVideos').useCarouselVideos

    render(
      <VideoCarouselProvider
        videos={[
          {
            source: 'video' as const,
            id: 'legacy-video-1',
            video: {
              id: 'legacy-video-1',
              title: [{ value: 'Legacy Video' }],
              variant: {
                duration: 60,
                hls: 'legacy-hls',
                slug: 'legacy-video'
              }
            }
          }
        ]}
      >
        <TestComponent />
      </VideoCarouselProvider>
    )

    // Should not call useCarouselVideos when videos prop is provided
    expect(mockUseCarouselVideos).not.toHaveBeenCalled()

    // Should use the provided videos
    expect(screen.getByTestId('active-video-id')).toHaveTextContent('legacy-video-1')
  })
})
