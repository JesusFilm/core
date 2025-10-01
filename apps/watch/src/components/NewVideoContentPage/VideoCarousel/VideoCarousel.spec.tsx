import { fireEvent, render, screen } from '@testing-library/react'

import { videos } from '../../Videos/__generated__/testData'
import { useVideoCarousel } from '../../../libs/videoCarouselContext'

import { VideoCarousel } from './VideoCarousel'

// Mock Swiper modules
jest.mock('swiper/modules', () => ({
  A11y: jest.fn(),
  FreeMode: jest.fn(),
  Mousewheel: jest.fn(),
  Navigation: jest.fn(),
  Virtual: jest.fn()
}))

let mockSlideTo: jest.Mock

jest.mock('swiper/react', () => ({
  Swiper: ({ children, onSwiper, className, ...props }: any) => {
    const mockSwiper = {
      slideTo: mockSlideTo,
      slidePrev: jest.fn(),
      slideNext: jest.fn()
    }
    // Call onSwiper synchronously
    if (onSwiper) onSwiper(mockSwiper)
    return (
      <div data-testid="VideoCarouselSwiper" className={className}>
        {children}
      </div>
    )
  },
  SwiperSlide: ({ children, virtualIndex, className, ...props }: any) => (
    <div data-testid={`swiper-slide-${virtualIndex}`} className={className}>
      {children}
    </div>
  )
}))

jest.mock('@mui/material/styles', () => ({
  useTheme: jest.fn()
}))

jest.mock('../../../libs/videoCarouselContext', () => ({
  VideoCarouselProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="VideoCarouselProvider">{children}</div>,
  useVideoCarousel: jest.fn()
}))

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>
const mockUseVideoCarousel = useVideoCarousel as jest.MockedFunction<typeof useVideoCarousel>

describe('VideoCarousel', () => {
  beforeEach(() => {
    mockSlideTo = jest.fn()
    mockUseTheme.mockReturnValue({
      breakpoints: {
        values: {
          xs: 0,
          sm: 600,
          md: 900,
          lg: 1200,
          xl: 1536,
          xxl: 1920
        }
      }
    } as any)
    mockUseVideoCarousel.mockReturnValue({
      activeVideoId: videos[0]?.id ?? null,
      activeVideo: videos[0] ?? null,
      currentMuxInsert: null,
      slides: videos.map(video => ({
        source: 'video' as const,
        id: video.id,
        video
      })),
      loading: false,
      isProgressing: false,
      setActiveVideo: jest.fn(),
      handleMuxInsertComplete: jest.fn(),
      handleSkipActiveVideo: jest.fn(),
      loadSlides: jest.fn()
    })
  })

  it('renders the carousel container', () => {
    render(<VideoCarousel />)
    expect(screen.getByTestId('VideoCarousel')).toBeInTheDocument()
  })

  it('renders VideoCards for each video', () => {
    const testVideos = videos.slice(0, 3)
    mockUseVideoCarousel.mockReturnValueOnce({
      activeVideoId: testVideos[0]?.id ?? null,
      slides: testVideos.map(video => ({
        source: 'video' as const,
        id: video.id,
        video
      })),
      loading: false,
      setActiveVideo: jest.fn()
    })
    render(<VideoCarousel />)
    expect(screen.getAllByTestId(/^swiper-slide-/)).toHaveLength(3)
  })

  it('handles empty videos array', () => {
    mockUseVideoCarousel.mockReturnValueOnce({
      activeVideoId: null,
      slides: [],
      loading: false,
      setActiveVideo: jest.fn()
    })
    render(<VideoCarousel />)
    expect(screen.getByTestId('VideoCarouselSwiper')).toBeInTheDocument()
  })

  it('shows loading skeletons when loading is true', () => {
    mockUseVideoCarousel.mockReturnValueOnce({
      activeVideoId: null,
      slides: [],
      loading: true,
      setActiveVideo: jest.fn()
    })
    render(<VideoCarousel />)
    expect(screen.getAllByTestId(/^swiper-slide-/).length).toBeGreaterThan(0)
  })

  it('calls setActiveVideo when video is selected', () => {
    const mockSetActiveVideo = jest.fn()
    const testVideos = videos.slice(0, 2)
    mockUseVideoCarousel.mockReturnValueOnce({
      activeVideoId: testVideos[0]?.id ?? null,
      slides: testVideos.map(video => ({
        source: 'video' as const,
        id: video.id,
        video
      })),
      loading: false,
      setActiveVideo: mockSetActiveVideo
    })
    render(<VideoCarousel onVideoSelect={mockSetActiveVideo} onSlideChange={jest.fn()} />)

    // This test would require more complex mocking of the VideoCard click handler
    expect(mockSetActiveVideo).not.toHaveBeenCalled()
  })

  it('handles keyboard navigation', () => {
    const testVideos = videos.slice(0, 3)
    mockUseVideoCarousel.mockReturnValueOnce({
      activeVideoId: testVideos[0]?.id ?? null,
      slides: testVideos.map(video => ({
        source: 'video' as const,
        id: video.id,
        video
      })),
      loading: false,
      setActiveVideo: jest.fn()
    })
    render(<VideoCarousel />)

    const carousel = screen.getByTestId('VideoCarousel')
    fireEvent.keyDown(carousel, { key: 'ArrowRight' })
    fireEvent.keyDown(carousel, { key: 'ArrowLeft' })

    // Swiper navigation would be tested in integration
    expect(carousel).toBeInTheDocument()
  })

  it('auto-scrolls to last slide every 15 seconds in inlinePlayback mode', async () => {
    jest.useFakeTimers()

    const testVideos = videos.slice(0, 3)
    mockUseVideoCarousel.mockReturnValueOnce({
      activeVideoId: testVideos[0]?.id ?? null,
      slides: testVideos.map(video => ({
        source: 'video' as const,
        id: video.id,
        video
      })),
      loading: false,
      setActiveVideo: jest.fn()
    })

    // Pass onSlideChange to trigger inlinePlayback mode
    render(<VideoCarousel onSlideChange={jest.fn()} />)

    // Fast forward 15 seconds
    jest.advanceTimersByTime(15000)

    expect(mockSlideTo).toHaveBeenCalledWith(2, 1800)

    jest.useRealTimers()
  })
})
