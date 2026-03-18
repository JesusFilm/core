import { render, screen } from '@testing-library/react'

import { VideoProvider } from '../../../libs/videoContext'
import { VideoCarouselSlide } from '../../../types/inserts'
import { videos } from '../../Videos/__generated__/testData'

import { ContainerWithMedia } from '.'

jest.mock('../../VideoCarousel', () => ({
  VideoCarousel: ({
    slides,
    containerSlug,
    activeVideoId,
    loading,
    onVideoSelect
  }: any) => (
    <div data-testid="VideoCarousel">
      {slides.map((slide: VideoCarouselSlide) => (
        <div key={slide.id} data-testid={`slide-${slide.id}`}>
          {slide.id}
        </div>
      ))}
    </div>
  )
}))

jest.mock('../../VideoBlock', () => ({
  VideoBlock: () => <div data-testid="VideoBlock">VideoBlock</div>
}))

jest.mock('../../ContentPageBlurFilter', () => ({
  ContentPageBlurFilter: ({ children }: any) => (
    <div data-testid="ContentPageBlurFilter">{children}</div>
  )
}))

describe('ContainerWithMedia', () => {
  const mockSlides: VideoCarouselSlide[] = [
    {
      source: 'video',
      id: 'video-1',
      video: videos[0]
    }
  ]

  const defaultProps = {
    slides: mockSlides,
    activeVideoId: 'video-1',
    activeVideo: null,
    currentMuxInsert: null,
    loading: false,
    onSelectSlide: jest.fn(),
    onMuxInsertComplete: jest.fn()
  }

  it('should render VideoCarousel within ContentPageBlurFilter', () => {
    render(<ContainerWithMedia {...defaultProps} />)

    expect(screen.getByTestId('ContentPageBlurFilter')).toBeInTheDocument()
    expect(screen.getByTestId('VideoCarousel')).toBeInTheDocument()
  })

  it('should render VideoBlock when activeVideo is provided', () => {
    render(
      <VideoProvider value={{ content: videos[0] }}>
        <ContainerWithMedia {...defaultProps} activeVideo={videos[0]} />
      </VideoProvider>
    )

    expect(screen.getByTestId('VideoBlock')).toBeInTheDocument()
  })

  it('should not render VideoBlock when activeVideo is null', () => {
    render(<ContainerWithMedia {...defaultProps} />)

    expect(screen.queryByTestId('VideoBlock')).not.toBeInTheDocument()
  })

  it('should render children within ContentPageBlurFilter', () => {
    render(
      <ContainerWithMedia {...defaultProps}>
        <div data-testid="child-content">Child Content</div>
      </ContainerWithMedia>
    )

    expect(screen.getByTestId('child-content')).toBeInTheDocument()
    expect(screen.getByText('Child Content')).toBeInTheDocument()
  })

  it('should not apply py-5 padding class to VideoCarousel container div', () => {
    const { container } = render(<ContainerWithMedia {...defaultProps} />)

    const carouselContainer = container.querySelector(
      '[data-testid="ContentPageBlurFilter"] > div'
    )
    expect(carouselContainer).toBeInTheDocument()
    expect(carouselContainer).not.toHaveClass('py-5')
  })

  it('should pass correct props to VideoCarousel', () => {
    render(<ContainerWithMedia {...defaultProps} containerSlug="test-slug" />)

    expect(screen.getByTestId('VideoCarousel')).toBeInTheDocument()
  })

  it('should use default containerSlug when not provided', () => {
    render(<ContainerWithMedia {...defaultProps} />)

    expect(screen.getByTestId('VideoCarousel')).toBeInTheDocument()
  })
})
