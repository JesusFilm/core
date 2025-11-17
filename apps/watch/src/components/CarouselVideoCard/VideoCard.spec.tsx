import { fireEvent, render, screen } from '@testing-library/react'

import { VideoLabel } from '../../../__generated__/globalTypes'
import { usePlayer } from '../../libs/playerContext'
import { UnifiedCardData } from '../../types/inserts'
import { videos } from '../../Videos/__generated__/testData'

import { VideoCard } from './VideoCard'

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

describe('VideoCard', () => {
  beforeEach(() => {
    mockUsePlayer.mockReturnValue({
      state: { progress: 0 }
    } as any)
  })

  it('renders video card with image and title', () => {
    render(<VideoCard data={mockVideoData} active={false} />)

    expect(screen.getByTestId('video-image')).toBeInTheDocument()
    expect(screen.getByText(mockVideoData.title[0].value)).toBeInTheDocument()
  })

  it('shows active border when active is true', () => {
    render(<VideoCard data={mockVideoData} active={true} />)

    const activeLayer = screen.getByTestId('ActiveLayer')
    expect(activeLayer).toHaveClass('shadow-[inset_0_0_0_4px_#fff]')
  })

  it('shows progress overlay when active and progress > 5', () => {
    mockUsePlayer.mockReturnValue({
      state: { progress: 25 }
    } as any)

    render(<VideoCard data={mockVideoData} active={true} />)

    const progressOverlay = screen.getByTestId('ProgressOverlay')
    expect(progressOverlay).toBeInTheDocument()
    expect(progressOverlay).toHaveStyle('width: 25%')
  })

  it('calls onVideoSelect when clicked in interactive mode', () => {
    const mockOnVideoSelect = jest.fn()

    render(
      <VideoCard
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
    render(<VideoCard data={mockVideoData} active={false} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/watch/test-video')
  })

  it('shows play button on hover when not active', () => {
    render(<VideoCard data={mockVideoData} active={false} />)

    const cardContent = screen.getByTestId(`CarouselItem-${mockVideoData.slug}`)
    fireEvent.mouseEnter(cardContent)

    const playButton = screen.getByTestId('ActiveLayer')
    expect(playButton).toHaveClass('shadow-[inset_0_0_0_4px_#fff]')
  })

  it('applies correct CSS classes for layout (flex-grow, h-full, min-h-full, w-full)', () => {
    const { container } = render(<VideoCard data={mockVideoData} active={false} />)

    const cardElement = container.querySelector('.flex.flex-col')
    expect(cardElement).toHaveClass('flex-grow')
    expect(cardElement).toHaveClass('h-full')
    expect(cardElement).toHaveClass('min-h-full')
    expect(cardElement).toHaveClass('w-full')
  })

  it('applies h-full and w-full classes to container element', () => {
    const { container } = render(<VideoCard data={mockVideoData} active={false} />)

    const containerElement = container.querySelector('.beveled.rounded-lg')
    expect(containerElement).toHaveClass('h-full')
    expect(containerElement).toHaveClass('w-full')
  })

  it('applies h-full class to content element', () => {
    const { container } = render(<VideoCard data={mockVideoData} active={false} />)

    const contentElement = container.querySelector('.relative.h-full')
    expect(contentElement).toHaveClass('h-full')
  })

  it('applies h-full min-h-full w-full classes to link/wrapper element', () => {
    const { container } = render(<VideoCard data={mockVideoData} active={false} />)

    const linkElement = screen.getByRole('link')
    expect(linkElement).toHaveClass('h-full')
    expect(linkElement).toHaveClass('min-h-full')
    expect(linkElement).toHaveClass('w-full')
  })
})
