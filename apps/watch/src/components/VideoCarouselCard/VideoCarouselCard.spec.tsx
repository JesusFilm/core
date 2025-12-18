import { fireEvent, render, screen } from '@testing-library/react'

import { VideoLabel } from '../../../__generated__/globalTypes'
import { usePlayer } from '../../libs/playerContext'
import { UnifiedCardData } from '../../types/inserts'

import { VideoCarouselCard } from '.'

jest.mock('next/image', () => {
  return function MockImage(props: any) {
    return <img data-testid="video-image" {...props} />
  }
})

jest.mock('../../libs/playerContext', () => ({
  usePlayer: jest.fn()
}))

jest.mock('../../libs/utils/getLabelDetails/getLabelDetails', () => ({
  getLabelDetails: () => ({ label: 'Chapter' })
}))

jest.mock('../../libs/utils/getWatchUrl', () => ({
  getWatchUrl: () => '/watch/test-video'
}))

jest.mock('next-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

jest.mock('../../libs/blurhash', () => ({
  useBlurhash: jest.fn(() => ({
    blurhash: null,
    dominantColor: null,
    isLoading: false,
    error: null
  })),
  blurImage: jest.fn(() => 'data:image/webp;base64,test')
}))

jest.mock('../../libs/thumbnail', () => ({
  useThumbnailUrl: jest.fn(() => ({
    thumbnailUrl: 'test-image.jpg',
    isLoading: false,
    error: null
  }))
}))

jest.mock('../../libs/watchContext', () => ({
  useWatch: jest.fn(() => ({
    state: { audioLanguageId: '529' }
  }))
}))

jest.mock('../../libs/playerContext', () => ({
  usePlayer: jest.fn(),
  useThrottledPlayerProgress: jest.fn(() => 0)
}))

const mockUsePlayer = usePlayer as jest.MockedFunction<typeof usePlayer>

// Create mock data using UnifiedCardData format
const mockVideoData: UnifiedCardData = {
  id: 'video-id',
  title: [{ value: 'Test Video' }],
  images: [{ mobileCinematicHigh: 'test-image.jpg' }],
  imageAlt: [{ value: 'Test video alt' }],
  label: VideoLabel.segment,
  slug: 'test-video',
  variant: { slug: 'test-video' }
}

describe('VideoCarouselCard', () => {
  beforeEach(() => {
    mockUsePlayer.mockReturnValue({
      state: { progress: 0 }
    } as any)
  })

  it('renders video card with image and title', () => {
    render(<VideoCarouselCard data={mockVideoData} active={false} />)

    expect(screen.getByTestId('video-image')).toBeInTheDocument()
    const titleText = Array.isArray(mockVideoData.title)
      ? mockVideoData.title[0].value
      : mockVideoData.title
    expect(screen.getByText(titleText)).toBeInTheDocument()
  })

  it('shows active border when active is true', () => {
    render(<VideoCarouselCard data={mockVideoData} active={true} />)

    const activeLayer = screen.getByTestId('ActiveLayer')
    expect(activeLayer).toHaveClass('shadow-[inset_0_0_0_4px_#fff]')
  })

  it('shows progress overlay when active and progress > 5', () => {
    mockUsePlayer.mockReturnValue({
      state: { progress: 25 }
    } as any)

    render(<VideoCarouselCard data={mockVideoData} active={true} />)

    const progressOverlay = screen.getByTestId('ProgressOverlay')
    expect(progressOverlay).toBeInTheDocument()
    expect(progressOverlay).toHaveStyle('width: 25%')
  })

  it('calls onVideoSelect when clicked in interactive mode', () => {
    const mockOnVideoSelect = jest.fn()

    render(
      <VideoCarouselCard
        data={mockVideoData}
        active={false}
        onVideoSelect={mockOnVideoSelect}
      />
    )

    const card = screen.getByTestId(`VideoCard-${mockVideoData.id}`)
    fireEvent.click(card)

    expect(mockOnVideoSelect).toHaveBeenCalledWith(mockVideoData.id)
  })

  it('renders as link when no onVideoSelect provided', () => {
    render(<VideoCarouselCard data={mockVideoData} active={false} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/watch/test-video')
  })

  it('shows play button on hover when not active', () => {
    render(<VideoCarouselCard data={mockVideoData} active={false} />)

    const cardContent = screen.getByTestId(`CarouselItem-${mockVideoData.slug}`)
    fireEvent.mouseEnter(cardContent)

    const playButton = screen.getByTestId('ActiveLayer')
    expect(playButton).toHaveClass('shadow-[inset_0_0_0_4px_#fff]')
  })

  it('applies correct CSS classes for layout (flex-grow, h-full, min-h-full, w-full)', () => {
    const { container } = render(
      <VideoCarouselCard data={mockVideoData} active={false} />
    )

    const cardElement = container.querySelector('.flex.flex-col')
    expect(cardElement).toHaveClass('flex-grow')
    expect(cardElement).toHaveClass('h-full')
    expect(cardElement).toHaveClass('min-h-full')
    expect(cardElement).toHaveClass('w-full')
  })

  it('applies h-full and w-full classes to container element', () => {
    const { container } = render(
      <VideoCarouselCard data={mockVideoData} active={false} />
    )

    const containerElement = container.querySelector('.beveled.rounded-lg')
    expect(containerElement).toHaveClass('h-full')
    expect(containerElement).toHaveClass('w-full')
  })

  it('applies h-full class to content element', () => {
    const { container } = render(
      <VideoCarouselCard data={mockVideoData} active={false} />
    )

    const contentElement = container.querySelector('.relative.h-full')
    expect(contentElement).toHaveClass('h-full')
  })

  it('applies h-full min-h-full w-full classes to link/wrapper element', () => {
    render(<VideoCarouselCard data={mockVideoData} active={false} />)

    const linkElement = screen.getByRole('link')
    expect(linkElement).toHaveClass('h-full')
    expect(linkElement).toHaveClass('min-h-full')
    expect(linkElement).toHaveClass('w-full')
  })
})
