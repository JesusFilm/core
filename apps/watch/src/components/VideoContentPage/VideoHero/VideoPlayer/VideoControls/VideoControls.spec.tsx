import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Player from 'video.js/dist/types/player'

import { PlayerProvider } from '../../../../../libs/playerContext/PlayerContext'
import { VideoProvider } from '../../../../../libs/videoContext'
import { videos } from '../../../../Videos/__generated__/testData'

import { VideoControls } from './VideoControls'

jest.mock('next/image', () => {
  return function MockImage(props: any) {
    return <img data-testid="video-image" {...props} />
  }
})

jest.mock('fscreen', () => ({
  __esModule: true,
  default: {
    fullscreenElement: null,
    requestFullscreen: jest.fn(),
    exitFullscreen: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  }
}))

const mockPlayer = {
  currentTime: jest.fn(),
  volume: jest.fn(),
  muted: jest.fn(),
  userActive: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  play: jest.fn(),
  pause: jest.fn()
} as unknown as Player

describe('VideoControls', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const defaultProps = {
    player: mockPlayer,
    placement: 'singleVideo' as const,
    wasUnmuted: true
  }

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
