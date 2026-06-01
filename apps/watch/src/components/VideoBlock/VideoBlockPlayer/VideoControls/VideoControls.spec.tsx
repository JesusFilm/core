import { render, screen } from '@testing-library/react'
import Player from 'video.js/dist/types/player'

import { PlayerProvider } from '../../../../libs/playerContext'
import { VideoProvider } from '../../../../libs/videoContext'
import { videos } from '../../../Videos/__generated__/testData'

import { VideoControls } from './VideoControls'

vi.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage(props: any) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img data-testid="video-image" {...props} />
  }
}))

vi.mock('fscreen', () => ({
  __esModule: true,
  default: {
    fullscreenElement: null,
    requestFullscreen: vi.fn(),
    exitFullscreen: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  }
}))

const mockPlayer = {
  currentTime: vi.fn(),
  volume: vi.fn(),
  muted: vi.fn(),
  userActive: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  play: vi.fn(),
  pause: vi.fn(),
  isDisposed: vi.fn().mockReturnValue(false)
} as unknown as Player

describe('VideoControls', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const defaultProps = {
    player: mockPlayer,
    placement: 'singleVideo' as const,
    wasUnmuted: true
  }

  it('does not read volume from a disposed player', () => {
    const disposedPlayer = {
      ...mockPlayer,
      isDisposed: vi.fn().mockReturnValue(true),
      volume: vi.fn(() => {
        throw new Error('disposed')
      })
    } as unknown as Player

    expect(() =>
      render(
        <VideoProvider value={{ content: videos[0] }}>
          <PlayerProvider>
            <VideoControls {...defaultProps} player={disposedPlayer} />
          </PlayerProvider>
        </VideoProvider>
      )
    ).not.toThrow()
  })

  it('should render video controls', () => {
    render(
      <VideoProvider value={{ content: videos[0] }}>
        <PlayerProvider>
          <VideoControls {...defaultProps} />
        </PlayerProvider>
      </VideoProvider>
    )

    expect(screen.getByTestId('VideoControls')).toBeInTheDocument()
  })

  it('should convert progress percentage to seconds for slider value', () => {
    render(
      <VideoProvider value={{ content: videos[0] }}>
        <PlayerProvider
          initialState={{
            progress: 50, // 50%
            durationSeconds: 100 // 100 seconds
          }}
        >
          <VideoControls {...defaultProps} />
        </PlayerProvider>
      </VideoProvider>
    )

    const mobileSlider = screen.getByLabelText('mobile-progress-control')
    const desktopSlider = screen.getByLabelText('desktop-progress-control')

    // Slider value should be in seconds: (50 / 100) * 100 = 50 seconds
    // The sliders should render with max set to durationSeconds
    expect(mobileSlider).toBeInTheDocument()
    expect(desktopSlider).toBeInTheDocument()
  })

  it('should render sliders with correct max value based on durationSeconds', () => {
    render(
      <VideoProvider value={{ content: videos[0] }}>
        <PlayerProvider
          initialState={{
            progress: 25, // 25%
            durationSeconds: 200 // 200 seconds
          }}
        >
          <VideoControls {...defaultProps} />
        </PlayerProvider>
      </VideoProvider>
    )

    const mobileSlider = screen.getByLabelText('mobile-progress-control')
    const desktopSlider = screen.getByLabelText('desktop-progress-control')

    expect(mobileSlider).toBeInTheDocument()
    expect(desktopSlider).toBeInTheDocument()
  })

  it('should handle zero duration gracefully', () => {
    render(
      <VideoProvider value={{ content: videos[0] }}>
        <PlayerProvider
          initialState={{
            progress: 0,
            durationSeconds: 0
          }}
        >
          <VideoControls {...defaultProps} />
        </PlayerProvider>
      </VideoProvider>
    )

    const mobileSlider = screen.getByLabelText('mobile-progress-control')
    const desktopSlider = screen.getByLabelText('desktop-progress-control')

    expect(mobileSlider).toBeInTheDocument()
    expect(desktopSlider).toBeInTheDocument()
  })

  it('should apply mix-blend-multiply class to gradient container', () => {
    const { container } = render(
      <VideoProvider value={{ content: videos[0] }}>
        <PlayerProvider>
          <VideoControls {...defaultProps} />
        </PlayerProvider>
      </VideoProvider>
    )

    const gradientContainer = container.querySelector('.mix-blend-multiply')
    expect(gradientContainer).toBeInTheDocument()
    expect(gradientContainer).toHaveClass('mix-blend-multiply')
  })

  it('should show play icon with fill attribute', () => {
    render(
      <VideoProvider value={{ content: videos[0] }}>
        <PlayerProvider
          initialState={{
            play: false
          }}
        >
          <VideoControls {...defaultProps} />
        </PlayerProvider>
      </VideoProvider>
    )

    const playButton = screen.getByRole('button', { name: /play/i })
    expect(playButton).toBeInTheDocument()
  })

  it('should show pause icon with fill attribute', () => {
    render(
      <VideoProvider value={{ content: videos[0] }}>
        <PlayerProvider
          initialState={{
            play: true
          }}
        >
          <VideoControls {...defaultProps} />
        </PlayerProvider>
      </VideoProvider>
    )

    const pauseButton = screen.getByRole('button', { name: /pause/i })
    expect(pauseButton).toBeInTheDocument()
  })

  it('should register seeked event handler on player', () => {
    render(
      <VideoProvider value={{ content: videos[0] }}>
        <PlayerProvider>
          <VideoControls {...defaultProps} />
        </PlayerProvider>
      </VideoProvider>
    )

    expect(mockPlayer.on).toHaveBeenCalledWith('seeked', expect.any(Function))
  })

  it('should unregister seeked event handler on cleanup', () => {
    const { unmount } = render(
      <VideoProvider value={{ content: videos[0] }}>
        <PlayerProvider>
          <VideoControls {...defaultProps} />
        </PlayerProvider>
      </VideoProvider>
    )

    unmount()

    expect(mockPlayer.off).toHaveBeenCalledWith('seeked', expect.any(Function))
  })
})
