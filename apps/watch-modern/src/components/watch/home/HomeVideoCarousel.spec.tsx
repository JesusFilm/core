import { render, screen, fireEvent } from '@testing-library/react'
import { HomeVideoCarousel } from './HomeVideoCarousel'
import type { CarouselVideoItem } from '@/server/getCarouselVideos'

// Mock the subcomponents to avoid complex video element testing
jest.mock('./Slide', () => ({
  Slide: ({ video, isActive }: any) => (
    <div data-testid={`slide-${video.id}`} data-active={isActive}>
      {video.title}
    </div>
  )
}))

jest.mock('./ArrowNav', () => ({
  ArrowNav: ({ onPrev, onNext }: any) => (
    <div>
      <button data-testid="prev-button" onClick={onPrev}>Prev</button>
      <button data-testid="next-button" onClick={onNext}>Next</button>
    </div>
  )
}))

jest.mock('./Bullets', () => ({
  Bullets: ({ total, activeIndex, onBulletClick, onPlayPause, isPlaying }: any) => (
    <div>
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          data-testid={`bullet-${i}`}
          data-active={i === activeIndex}
          onClick={() => onBulletClick(i)}
        >
          {i}
        </button>
      ))}
      <button data-testid="play-pause" onClick={onPlayPause}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  )
}))

jest.mock('./MuteToggle', () => ({
  MuteToggle: ({ isMuted, onToggle }: any) => (
    <button data-testid="mute-toggle" data-muted={isMuted} onClick={onToggle}>
      {isMuted ? 'Unmute' : 'Mute'}
    </button>
  )
}))

const mockVideos: CarouselVideoItem[] = [
  {
    id: '1',
    label: 'film',
    title: 'Test Video 1',
    description: 'Test description 1',
    slug: 'test-video-1',
    variantSlug: 'test-1',
    hlsUrl: 'https://example.com/video1.m3u8',
    imageUrl: 'https://example.com/image1.jpg',
    variantLanguagesCount: 5,
    languageSlugOverride: null
  },
  {
    id: '2',
    label: 'series',
    title: 'Test Video 2',
    description: 'Test description 2',
    slug: 'test-video-2',
    variantSlug: 'test-2',
    hlsUrl: 'https://example.com/video2.m3u8',
    imageUrl: 'https://example.com/image2.jpg',
    variantLanguagesCount: 3,
    languageSlugOverride: null
  }
]

describe('HomeVideoCarousel', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  it('renders with videos', () => {
    render(<HomeVideoCarousel videos={mockVideos} watchUrl="https://example.com/watch" />)

    expect(screen.getByTestId('slide-1')).toBeInTheDocument()
    expect(screen.getByTestId('slide-2')).toBeInTheDocument()
    expect(screen.getByTestId('prev-button')).toBeInTheDocument()
    expect(screen.getByTestId('next-button')).toBeInTheDocument()
    expect(screen.getByTestId('bullet-0')).toBeInTheDocument()
    expect(screen.getByTestId('bullet-1')).toBeInTheDocument()
    expect(screen.getByTestId('mute-toggle')).toBeInTheDocument()
  })

  it('starts with first slide active', () => {
    render(<HomeVideoCarousel videos={mockVideos} watchUrl="https://example.com/watch" />)

    expect(screen.getByTestId('slide-1')).toHaveAttribute('data-active', 'true')
    expect(screen.getByTestId('slide-2')).toHaveAttribute('data-active', 'false')
  })

  it('navigates to next slide when next button is clicked', () => {
    render(<HomeVideoCarousel videos={mockVideos} watchUrl="https://example.com/watch" />)

    fireEvent.click(screen.getByTestId('next-button'))

    expect(screen.getByTestId('slide-1')).toHaveAttribute('data-active', 'false')
    expect(screen.getByTestId('slide-2')).toHaveAttribute('data-active', 'true')
  })

  it('navigates to previous slide when prev button is clicked', () => {
    render(<HomeVideoCarousel videos={mockVideos} watchUrl="https://example.com/watch" />)

    // Start on second slide
    fireEvent.click(screen.getByTestId('next-button'))

    // Go back to first slide
    fireEvent.click(screen.getByTestId('prev-button'))

    expect(screen.getByTestId('slide-1')).toHaveAttribute('data-active', 'true')
    expect(screen.getByTestId('slide-2')).toHaveAttribute('data-active', 'false')
  })

  it('navigates to specific slide when bullet is clicked', () => {
    render(<HomeVideoCarousel videos={mockVideos} watchUrl="https://example.com/watch" />)

    fireEvent.click(screen.getByTestId('bullet-1'))

    expect(screen.getByTestId('slide-1')).toHaveAttribute('data-active', 'false')
    expect(screen.getByTestId('slide-2')).toHaveAttribute('data-active', 'true')
  })

  it('toggles mute when mute button is clicked', () => {
    render(<HomeVideoCarousel videos={mockVideos} watchUrl="https://example.com/watch" />)

    const muteButton = screen.getByTestId('mute-toggle')
    expect(muteButton).toHaveAttribute('data-muted', 'true')

    fireEvent.click(muteButton)
    expect(muteButton).toHaveAttribute('data-muted', 'false')
  })

  it('auto-advances slides after 15 seconds', () => {
    render(<HomeVideoCarousel videos={mockVideos} watchUrl="https://example.com/watch" />)

    // Fast-forward 15 seconds
    jest.advanceTimersByTime(15000)

    expect(screen.getByTestId('slide-1')).toHaveAttribute('data-active', 'false')
    expect(screen.getByTestId('slide-2')).toHaveAttribute('data-active', 'true')
  })

  it('pauses auto-advance when play/pause is clicked', () => {
    render(<HomeVideoCarousel videos={mockVideos} watchUrl="https://example.com/watch" />)

    // Pause the carousel
    fireEvent.click(screen.getByTestId('play-pause'))

    // Fast-forward 15 seconds
    jest.advanceTimersByTime(15000)

    // Should still be on first slide since paused
    expect(screen.getByTestId('slide-1')).toHaveAttribute('data-active', 'true')
    expect(screen.getByTestId('slide-2')).toHaveAttribute('data-active', 'false')
  })

  it('renders nothing when videos array is empty', () => {
    const { container } = render(<HomeVideoCarousel videos={[]} watchUrl="https://example.com/watch" />)

    expect(container.firstChild).toBeNull()
  })

  it('has proper accessibility attributes', () => {
    render(<HomeVideoCarousel videos={mockVideos} watchUrl="https://example.com/watch" />)

    const carousel = screen.getByRole('region')
    expect(carousel).toHaveAttribute('aria-roledescription', 'carousel')
    expect(carousel).toHaveAttribute('tabindex', '0')
  })

  it('handles keyboard navigation with arrow keys', () => {
    render(<HomeVideoCarousel videos={mockVideos} watchUrl="https://example.com/watch" />)

    const carousel = screen.getByRole('region')

    // Navigate to next slide with right arrow
    fireEvent.keyDown(carousel, { key: 'ArrowRight' })
    expect(screen.getByTestId('slide-1')).toHaveAttribute('data-active', 'false')
    expect(screen.getByTestId('slide-2')).toHaveAttribute('data-active', 'true')

    // Navigate back with left arrow
    fireEvent.keyDown(carousel, { key: 'ArrowLeft' })
    expect(screen.getByTestId('slide-1')).toHaveAttribute('data-active', 'true')
    expect(screen.getByTestId('slide-2')).toHaveAttribute('data-active', 'false')
  })

  it('handles keyboard play/pause with space and enter keys', () => {
    render(<HomeVideoCarousel videos={mockVideos} watchUrl="https://example.com/watch" />)

    const carousel = screen.getByRole('region')
    const playPauseButton = screen.getByTestId('play-pause')

    // Should start playing
    expect(playPauseButton).toHaveTextContent('Pause')

    // Pause with space key
    fireEvent.keyDown(carousel, { key: ' ' })
    expect(playPauseButton).toHaveTextContent('Play')

    // Play with enter key
    fireEvent.keyDown(carousel, { key: 'Enter' })
    expect(playPauseButton).toHaveTextContent('Pause')
  })

  it('persists mute preference in sessionStorage', () => {
    // Mock sessionStorage
    const mockSessionStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      key: jest.fn(),
      length: 0
    }

    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage,
      writable: true
    })

    // First render should load default (muted: true)
    mockSessionStorage.getItem.mockReturnValue(null)
    render(<HomeVideoCarousel videos={mockVideos} watchUrl="https://example.com/watch" />)

    const muteButton = screen.getByTestId('mute-toggle')
    expect(muteButton).toHaveAttribute('data-muted', 'true')

    // Click to unmute
    fireEvent.click(muteButton)
    expect(muteButton).toHaveAttribute('data-muted', 'false')
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith('watch-modern-carousel-muted', 'false')

    // Second render should load saved preference
    mockSessionStorage.getItem.mockReturnValue('false')
    render(<HomeVideoCarousel videos={mockVideos} watchUrl="https://example.com/watch" />)
    expect(screen.getByTestId('mute-toggle')).toHaveAttribute('data-muted', 'false')
  })
})
