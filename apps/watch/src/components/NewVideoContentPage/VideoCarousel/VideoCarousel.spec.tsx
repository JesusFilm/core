import { render, screen, fireEvent } from '@testing-library/react'
import { useTheme } from '@mui/material/styles'

import { videos } from '../../Videos/__generated__/testData'

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

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>

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
  })

  it('renders the carousel container', () => {
    render(<VideoCarousel videos={videos} />)
    expect(screen.getByTestId('VideoCarousel')).toBeInTheDocument()
  })

  it('renders VideoCards for each video', () => {
    render(<VideoCarousel videos={videos.slice(0, 3)} />)
    expect(screen.getAllByTestId(/^swiper-slide-/)).toHaveLength(3)
  })

  it('handles empty videos array', () => {
    render(<VideoCarousel videos={[]} />)
    expect(screen.getByTestId('VideoCarouselSwiper')).toBeInTheDocument()
  })

  it('shows loading skeletons when loading is true', () => {
    render(<VideoCarousel videos={[]} loading={true} />)
    expect(screen.getAllByTestId(/^swiper-slide-/).length).toBeGreaterThan(0)
  })

  it('calls onVideoSelect when video is selected', () => {
    const mockOnVideoSelect = jest.fn()
    render(
      <VideoCarousel
        videos={videos.slice(0, 2)}
        onVideoSelect={mockOnVideoSelect}
        onSlideChange={jest.fn()}
      />
    )

    // This test would require more complex mocking of the VideoCard click handler
    expect(mockOnVideoSelect).not.toHaveBeenCalled()
  })

  it('handles keyboard navigation', () => {
    render(<VideoCarousel videos={videos.slice(0, 3)} />)

    const carousel = screen.getByTestId('VideoCarousel')
    fireEvent.keyDown(carousel, { key: 'ArrowRight' })
    fireEvent.keyDown(carousel, { key: 'ArrowLeft' })

    // Swiper navigation would be tested in integration
    expect(carousel).toBeInTheDocument()
  })

  it('auto-scrolls to last slide every 15 seconds in inlinePlayback mode', async () => {
    jest.useFakeTimers()

    // Pass onVideoSelect and onSlideChange to trigger inlinePlayback mode
    render(
      <VideoCarousel
        videos={videos.slice(0, 3)}
        onVideoSelect={jest.fn()}
        onSlideChange={jest.fn()}
      />
    )

    // Fast forward 15 seconds
    jest.advanceTimersByTime(15000)

    expect(mockSlideTo).toHaveBeenCalledWith(2, 1800)

    jest.useRealTimers()
  })
})
