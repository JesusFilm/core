import { fireEvent, render, screen } from '@testing-library/react'

import { usePlayer } from '../../../../libs/playerContext'
import { videos } from '../../../Videos/__generated__/testData'

import { VideoCard } from './VideoCard'

jest.mock('next/image', () => {
  return function MockImage(props: any) {
    return <img data-testid="video-image" {...props} />
  }
})

jest.mock('../../../../libs/playerContext', () => ({
  usePlayer: jest.fn()
}))

jest.mock('../../../../libs/utils/getLabelDetails/getLabelDetails', () => ({
  getLabelDetails: () => ({ label: 'Chapter' })
}))

jest.mock('../../../../libs/utils/getWatchUrl', () => ({
  getWatchUrl: () => '/watch/test-video'
}))

jest.mock('next-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

const mockUsePlayer = usePlayer as jest.MockedFunction<typeof usePlayer>

describe('VideoCard', () => {
  const mockVideo = videos[0]

  beforeEach(() => {
    mockUsePlayer.mockReturnValue({
      state: { progress: 0 }
    } as any)
  })

  it('renders video card with image and title', () => {
    render(<VideoCard video={mockVideo} active={false} />)

    expect(screen.getByTestId('video-image')).toBeInTheDocument()
    expect(screen.getByText(mockVideo.title[0].value)).toBeInTheDocument()
  })

  it('shows active border when active is true', () => {
    render(<VideoCard video={mockVideo} active={true} />)

    const activeLayer = screen.getByTestId('ActiveLayer')
    expect(activeLayer).toHaveClass('shadow-[inset_0_0_0_4px_#fff]')
  })

  it('shows progress overlay when active and progress > 5', () => {
    mockUsePlayer.mockReturnValue({
      state: { progress: 25 }
    } as any)

    render(<VideoCard video={mockVideo} active={true} />)

    const progressOverlay = screen.getByTestId('ProgressOverlay')
    expect(progressOverlay).toBeInTheDocument()
    expect(progressOverlay).toHaveStyle('width: 25%')
  })

  it('calls onVideoSelect when clicked in interactive mode', () => {
    const mockOnVideoSelect = jest.fn()

    render(
      <VideoCard
        video={mockVideo}
        active={false}
        onVideoSelect={mockOnVideoSelect}
      />
    )

    const card = screen.getByTestId(`VideoCard-${mockVideo.id}`)
    fireEvent.click(card)

    expect(mockOnVideoSelect).toHaveBeenCalledWith(mockVideo.id)
  })

  it('renders as link when no onVideoSelect provided', () => {
    render(<VideoCard video={mockVideo} active={false} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/watch/test-video')
  })

  it('shows play button on hover when not active', () => {
    render(<VideoCard video={mockVideo} active={false} />)

    const cardContent = screen.getByTestId(`CarouselItem-${mockVideo.slug}`)
    fireEvent.mouseEnter(cardContent)

    const playButton = screen.getByTestId('ActiveLayer')
    expect(playButton).toHaveClass('shadow-[inset_0_0_0_4px_#fff]')
  })
})
