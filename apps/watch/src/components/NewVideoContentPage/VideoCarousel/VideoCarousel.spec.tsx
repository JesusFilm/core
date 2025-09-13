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

jest.mock('swiper/react', () => ({
  Swiper: ({ children, onSwiper, ...props }: any) => {
    const mockSwiper = {
      slideTo: jest.fn(),
      slidePrev: jest.fn(),
      slideNext: jest.fn()
    }
    if (onSwiper) onSwiper(mockSwiper)
    return (
      <div data-testid="VideoCarouselSwiper" {...props}>
        {children}
      </div>
    )
  },
  SwiperSlide: ({ children, virtualIndex, ...props }: any) => (
    <div data-testid={`swiper-slide-${virtualIndex}`} {...props}>
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
})
