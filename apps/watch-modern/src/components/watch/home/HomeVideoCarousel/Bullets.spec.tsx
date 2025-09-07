import { render, screen, fireEvent } from '@testing-library/react'
import { Bullets } from './Bullets'

describe('Bullets', () => {
  const mockOnBulletClick = jest.fn()
  const mockOnPlayPause = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correct number of bullets', () => {
    render(
      <Bullets
        total={3}
        activeIndex={0}
        progress={5}
        onBulletClick={mockOnBulletClick}
        onPlayPause={mockOnPlayPause}
        isPlaying={true}
      />
    )

    expect(screen.getByLabelText('Go to slide 1 of 3')).toBeInTheDocument()
    expect(screen.getByLabelText('Go to slide 2 of 3')).toBeInTheDocument()
    expect(screen.getByLabelText('Go to slide 3 of 3')).toBeInTheDocument()
  })

  it('marks active bullet correctly', () => {
    render(
      <Bullets
        total={3}
        activeIndex={1}
        progress={5}
        onBulletClick={mockOnBulletClick}
        onPlayPause={mockOnPlayPause}
        isPlaying={true}
      />
    )

    const bullet0 = screen.getByLabelText('Go to slide 1 of 3')
    const bullet1 = screen.getByLabelText('Go to slide 2 of 3')
    const bullet2 = screen.getByLabelText('Go to slide 3 of 3')

    expect(bullet0).toHaveAttribute('aria-current', 'false')
    expect(bullet1).toHaveAttribute('aria-current', 'true')
    expect(bullet2).toHaveAttribute('aria-current', 'false')
  })

  it('calls onBulletClick with correct index when bullet is clicked', () => {
    render(
      <Bullets
        total={3}
        activeIndex={0}
        progress={5}
        onBulletClick={mockOnBulletClick}
        onPlayPause={mockOnPlayPause}
        isPlaying={true}
      />
    )

    fireEvent.click(screen.getByLabelText('Go to slide 2 of 3'))

    expect(mockOnBulletClick).toHaveBeenCalledWith(1)
  })

  it('shows play button when paused', () => {
    render(
      <Bullets
        total={2}
        activeIndex={0}
        progress={5}
        onBulletClick={mockOnBulletClick}
        onPlayPause={mockOnPlayPause}
        isPlaying={false}
      />
    )

    expect(screen.getByLabelText('Play carousel')).toBeInTheDocument()
  })

  it('shows pause button when playing', () => {
    render(
      <Bullets
        total={2}
        activeIndex={0}
        progress={5}
        onBulletClick={mockOnBulletClick}
        onPlayPause={mockOnPlayPause}
        isPlaying={true}
      />
    )

    expect(screen.getByLabelText('Pause carousel')).toBeInTheDocument()
  })

  it('calls onPlayPause when play/pause button is clicked', () => {
    render(
      <Bullets
        total={2}
        activeIndex={0}
        progress={5}
        onBulletClick={mockOnBulletClick}
        onPlayPause={mockOnPlayPause}
        isPlaying={true}
      />
    )

    fireEvent.click(screen.getByLabelText('Pause carousel'))

    expect(mockOnPlayPause).toHaveBeenCalledTimes(1)
  })

  it('displays correct progress ring for active bullet', () => {
    render(
      <Bullets
        total={2}
        activeIndex={0}
        progress={7.5} // Half of 15 seconds
        onBulletClick={mockOnBulletClick}
        onPlayPause={mockOnPlayPause}
        isPlaying={true}
      />
    )

    // Check that SVG progress ring exists
    const progressRing = screen.getByTestId('progress-ring-0')
    expect(progressRing).toBeInTheDocument()
  })

  it('has proper styling for bullets', () => {
    render(
      <Bullets
        total={2}
        activeIndex={0}
        progress={5}
        onBulletClick={mockOnBulletClick}
        onPlayPause={mockOnPlayPause}
        isPlaying={true}
      />
    )

    const activeBullet = screen.getByLabelText('Go to slide 1 of 2')
    const inactiveBullet = screen.getByLabelText('Go to slide 2 of 2')

    expect(activeBullet).toHaveClass('bg-white', 'scale-125')
    expect(inactiveBullet).toHaveClass('bg-white/40', 'hover:bg-white/60')
  })

  it('has proper play/pause button styling', () => {
    render(
      <Bullets
        total={2}
        activeIndex={0}
        progress={5}
        onBulletClick={mockOnBulletClick}
        onPlayPause={mockOnPlayPause}
        isPlaying={true}
      />
    )

    const playPauseButton = screen.getByLabelText('Pause carousel')

    expect(playPauseButton).toHaveClass(
      'h-8', 'w-8', 'rounded-full', 'bg-black/20', 'backdrop-blur-sm',
      'text-white', 'hover:bg-black/40', 'transition-all', 'duration-200'
    )
  })

  describe('Accessibility Features (Phase 4)', () => {
    it('bullets have proper ARIA attributes', () => {
      render(
        <Bullets
          total={3}
          activeIndex={1}
          progress={5}
          onBulletClick={mockOnBulletClick}
          onPlayPause={mockOnPlayPause}
          isPlaying={true}
        />
      )

      const bullet1 = screen.getByLabelText('Go to slide 2 of 3')
      const bullet2 = screen.getByLabelText('Go to slide 3 of 3')

      // Active bullet should have aria-current="true"
      expect(bullet1).toHaveAttribute('aria-current', 'true')

      // Inactive bullets should have aria-current="false"
      expect(bullet2).toHaveAttribute('aria-current', 'false')
    })

    it('play/pause button has proper ARIA attributes', () => {
      render(
        <Bullets
          total={2}
          activeIndex={0}
          progress={5}
          onBulletClick={mockOnBulletClick}
          onPlayPause={mockOnPlayPause}
          isPlaying={true}
        />
      )

      const pauseButton = screen.getByLabelText('Pause carousel')
      expect(pauseButton).toHaveAttribute('aria-label', 'Pause carousel')
    })

    it('play button has proper ARIA attributes when paused', () => {
      render(
        <Bullets
          total={2}
          activeIndex={0}
          progress={5}
          onBulletClick={mockOnBulletClick}
          onPlayPause={mockOnPlayPause}
          isPlaying={false}
        />
      )

      const playButton = screen.getByLabelText('Play carousel')
      expect(playButton).toHaveAttribute('aria-label', 'Play carousel')
    })

    it('all interactive elements are keyboard accessible', () => {
      render(
        <Bullets
          total={3}
          activeIndex={0}
          progress={5}
          onBulletClick={mockOnBulletClick}
          onPlayPause={mockOnPlayPause}
          isPlaying={true}
        />
      )

      const bullet1 = screen.getByLabelText('Go to slide 1 of 3')
      const bullet2 = screen.getByLabelText('Go to slide 2 of 3')
      const bullet3 = screen.getByLabelText('Go to slide 3 of 3')
      const pauseButton = screen.getByLabelText('Pause carousel')

      // All elements should be in the document and accessible via screen reader
      expect(bullet1).toBeInTheDocument()
      expect(bullet2).toBeInTheDocument()
      expect(bullet3).toBeInTheDocument()
      expect(pauseButton).toBeInTheDocument()

      // Elements should be visible (not aria-hidden)
      expect(bullet1).not.toHaveAttribute('aria-hidden', 'true')
      expect(bullet2).not.toHaveAttribute('aria-hidden', 'true')
      expect(bullet3).not.toHaveAttribute('aria-hidden', 'true')
      expect(pauseButton).not.toHaveAttribute('aria-hidden', 'true')
    })

    it('provides clear navigation feedback', () => {
      render(
        <Bullets
          total={5}
          activeIndex={2}
          progress={8}
          onBulletClick={mockOnBulletClick}
          onPlayPause={mockOnPlayPause}
          isPlaying={true}
        />
      )

      // Verify each bullet has descriptive label
      expect(screen.getByLabelText('Go to slide 1 of 5')).toBeInTheDocument()
      expect(screen.getByLabelText('Go to slide 2 of 5')).toBeInTheDocument()
      expect(screen.getByLabelText('Go to slide 3 of 5')).toBeInTheDocument()
      expect(screen.getByLabelText('Go to slide 4 of 5')).toBeInTheDocument()
      expect(screen.getByLabelText('Go to slide 5 of 5')).toBeInTheDocument()

      // Verify active bullet is clearly marked
      const activeBullet = screen.getByLabelText('Go to slide 3 of 5')
      expect(activeBullet).toHaveAttribute('aria-current', 'true')
    })

    it('maintains accessibility when carousel state changes', () => {
      const { rerender } = render(
        <Bullets
          total={3}
          activeIndex={0}
          progress={5}
          onBulletClick={mockOnBulletClick}
          onPlayPause={mockOnPlayPause}
          isPlaying={true}
        />
      )

      // Initially first bullet is active
      expect(screen.getByLabelText('Go to slide 1 of 3')).toHaveAttribute('aria-current', 'true')
      expect(screen.getByLabelText('Go to slide 2 of 3')).toHaveAttribute('aria-current', 'false')

      // Rerender with different active index
      rerender(
        <Bullets
          total={3}
          activeIndex={1}
          progress={5}
          onBulletClick={mockOnBulletClick}
          onPlayPause={mockOnPlayPause}
          isPlaying={true}
        />
      )

      // Now second bullet should be active
      expect(screen.getByLabelText('Go to slide 1 of 3')).toHaveAttribute('aria-current', 'false')
      expect(screen.getByLabelText('Go to slide 2 of 3')).toHaveAttribute('aria-current', 'true')
    })
  })
})
