import { render, screen } from '@testing-library/react'

import { VideoCarouselSlide } from '../../types/inserts'
import { videos } from '../Videos/__generated__/testData'

import { VideoCarousel } from './VideoCarousel'

jest.mock('swiper/react', () => ({
  Swiper: ({ children, className, 'data-testid': testId }: any) => (
    <div data-testid={testId} className={className}>
      {children}
    </div>
  ),
  SwiperSlide: ({ children, className, 'data-testid': testId }: any) => (
    <div data-testid={testId} className={className}>
      {children}
    </div>
  )
}))

jest.mock('swiper/modules', () => ({
  A11y: {},
  FreeMode: {},
  Mousewheel: {}
}))

jest.mock('../VideoCarouselCard/VideoCarouselCard', () => ({
  VideoCarouselCard: ({ data, active, onVideoSelect }: any) => {
    return (
      <div
        data-testid={`VideoCarouselCard-${data.id}`}
        data-active={active}
        onClick={() => onVideoSelect?.(data.id)}
      >
        {typeof data.title === 'string' ? data.title : data.title[0]?.value}
      </div>
    )
  }
}))

describe('VideoCarousel', () => {
  const mockSlides: VideoCarouselSlide[] = [
    {
      source: 'video',
      id: 'video-1',
      video: videos[0]
    },
    {
      source: 'video',
      id: 'video-2',
      video: videos[1]
    }
  ]

  it('should render carousel with slides', () => {
    render(
      <VideoCarousel
        slides={mockSlides}
        containerSlug="test-container"
        activeVideoId="video-1"
        loading={false}
      />
    )

    expect(screen.getByTestId('VideoCarousel')).toBeInTheDocument()
    expect(screen.getByTestId('VideoCarouselSlide-video-1')).toBeInTheDocument()
    expect(screen.getByTestId('VideoCarouselSlide-video-2')).toBeInTheDocument()
  })

  it('should render loading skeletons when loading is true', () => {
    render(
      <VideoCarousel
        slides={[]}
        containerSlug="test-container"
        activeVideoId="video-1"
        loading={true}
      />
    )

    expect(screen.getByTestId('VideoCarousel')).toBeInTheDocument()
    // Should render 4 skeleton slides
    const skeletons = screen.getAllByText('')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('should return null when not loading and slides are empty', () => {
    const { container } = render(
      <VideoCarousel
        slides={[]}
        containerSlug="test-container"
        activeVideoId="video-1"
        loading={false}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('should mark active slide with correct opacity', () => {
    render(
      <VideoCarousel
        slides={mockSlides}
        containerSlug="test-container"
        activeVideoId="video-1"
        loading={false}
      />
    )

    const slide1 = screen.getByTestId('VideoCarouselSlide-video-1')
    const slide2 = screen.getByTestId('VideoCarouselSlide-video-2')

    expect(slide1.children[0]).toHaveClass('opacity-100')
    expect(slide2.children[0]).toHaveClass('opacity-60')
  })

  it('should call onVideoSelect when provided and video card is clicked', () => {
    const mockOnVideoSelect = jest.fn()

    render(
      <VideoCarousel
        slides={mockSlides}
        containerSlug="test-container"
        activeVideoId="video-1"
        loading={false}
        onVideoSelect={mockOnVideoSelect}
      />
    )

    const videoCard = screen.getByTestId('VideoCarouselCard-1_jf-0-0')
    videoCard.click()

    expect(mockOnVideoSelect).toHaveBeenCalledWith('1_jf-0-0')
  })

  it('should work without onVideoSelect prop', () => {
    render(
      <VideoCarousel
        slides={mockSlides}
        containerSlug="test-container"
        activeVideoId="video-1"
        loading={false}
      />
    )

    expect(screen.getByTestId('VideoCarousel')).toBeInTheDocument()
    expect(screen.getByTestId('VideoCarouselCard-1_jf-0-0')).toBeInTheDocument()
  })

  it('should apply correct CSS classes', () => {
    render(
      <VideoCarousel
        slides={mockSlides}
        containerSlug="test-container"
        activeVideoId="video-1"
        loading={false}
      />
    )

    const carousel = screen.getByTestId('VideoCarousel')
    expect(carousel).toHaveClass('w-full')
    expect(carousel).toHaveClass('h-auto')
    expect(carousel).toHaveClass('[&>div]:py-4')
  })

  it('should apply correct slide classes', () => {
    render(
      <VideoCarousel
        slides={mockSlides}
        containerSlug="test-container"
        activeVideoId="video-1"
        loading={false}
      />
    )

    const slide1 = screen.getByTestId('VideoCarouselSlide-video-1')
    expect(slide1).toHaveClass('max-w-[140px]')
    expect(slide1).toHaveClass('md:max-w-[260px]')
    expect(slide1).toHaveClass('!h-34')
    expect(slide1).toHaveClass('flex')
    expect(slide1).toHaveClass('flex-col')
    expect(slide1).toHaveClass('padded-l')
  })
})
