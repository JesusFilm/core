import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import videojs from 'video.js'
import type Player from 'video.js/dist/types/player'

import { VideoPlayer } from '.'

import { mockPlayer } from '@/setupTests'

jest.mock('@/env', () => ({
  env: {
    NEXT_PUBLIC_MUX_DEFAULT_REPORTING_KEY: 'test-key'
  }
}))

describe('VideoPlayer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPlayer.paused.mockReturnValue(true)
    mockPlayer.isDisposed.mockReturnValue(false)
    ;(videojs.getPlayer as jest.Mock).mockReturnValue(
      mockPlayer as unknown as Player
    )
  })

  it('initializes video.js player', () => {
    render(
      <VideoPlayer
        hlsUrl="https://example.com/video.m3u8"
        videoTitle="Test Video"
      />
    )

    expect(videojs).toHaveBeenCalled()
  })

  it('sets HLS source on initialization', async () => {
    render(
      <VideoPlayer
        hlsUrl="https://example.com/video.m3u8"
        videoTitle="Test Video"
      />
    )

    await waitFor(() => {
      expect(mockPlayer.src).toHaveBeenCalledWith({
        src: 'https://example.com/video.m3u8',
        type: 'application/x-mpegURL'
      })
    })
  })

  it('sets poster/thumbnail when provided', async () => {
    render(
      <VideoPlayer
        hlsUrl="https://example.com/video.m3u8"
        videoTitle="Test Video"
        thumbnail="https://example.com/thumb.jpg"
      />
    )

    await waitFor(() => {
      expect(mockPlayer.poster).toHaveBeenCalledWith(
        'https://example.com/thumb.jpg'
      )
    })
  })

  it('calls onVideoEnd when video ends', () => {
    const onVideoEnd = jest.fn()
    render(
      <VideoPlayer
        hlsUrl="https://example.com/video.m3u8"
        videoTitle="Test Video"
        onVideoEnd={onVideoEnd}
      />
    )

    const endedHandler = (mockPlayer.on).mock.calls.find(
      (call) => call[0] === 'ended'
    )?.[1]

    if (endedHandler) {
      endedHandler()
      expect(onVideoEnd).toHaveBeenCalled()
    }
  })

  it('updates HLS URL when prop changes', async () => {
    const { rerender } = render(
      <VideoPlayer
        hlsUrl="https://example.com/video1.m3u8"
        videoTitle="Test Video"
      />
    )

    rerender(
      <VideoPlayer
        hlsUrl="https://example.com/video2.m3u8"
        videoTitle="Test Video"
      />
    )

    await waitFor(() => {
      expect(mockPlayer.src).toHaveBeenCalledWith({
        src: 'https://example.com/video2.m3u8',
        type: 'application/x-mpegURL'
      })
    })
  })

  it('updates poster when thumbnail prop changes', async () => {
    const { rerender } = render(
      <VideoPlayer
        hlsUrl="https://example.com/video.m3u8"
        videoTitle="Test Video"
        thumbnail="https://example.com/thumb1.jpg"
      />
    )

    rerender(
      <VideoPlayer
        hlsUrl="https://example.com/video.m3u8"
        videoTitle="Test Video"
        thumbnail="https://example.com/thumb2.jpg"
      />
    )

    await waitFor(() => {
      expect(mockPlayer.poster).toHaveBeenCalledWith(
        'https://example.com/thumb2.jpg'
      )
    })
  })

  it('toggles play/pause on click', async () => {
    const user = userEvent.setup()
    mockPlayer.paused.mockReturnValue(true)

    const { container } = render(
      <VideoPlayer
        hlsUrl="https://example.com/video.m3u8"
        videoTitle="Test Video"
      />
    )

    const videoContainer = container.querySelector('[data-vjs-player]')
    if (videoContainer) {
      await user.click(videoContainer as HTMLElement)
      await waitFor(() => {
        expect(mockPlayer.play).toHaveBeenCalled()
      })
    }
  })

  it('pauses video when clicking on playing video', async () => {
    const user = userEvent.setup()
    mockPlayer.paused.mockReturnValue(false)

    const { container } = render(
      <VideoPlayer
        hlsUrl="https://example.com/video.m3u8"
        videoTitle="Test Video"
      />
    )

    const videoContainer = container.querySelector('[data-vjs-player]')
    if (videoContainer) {
      await user.click(videoContainer as HTMLElement)
      await waitFor(() => {
        expect(mockPlayer.pause).toHaveBeenCalled()
      })
    }
  })

  it('does not toggle when clicking controls', async () => {
    const user = userEvent.setup()
    mockPlayer.paused.mockReturnValue(true)
    jest.clearAllMocks()

    const { container } = render(
      <VideoPlayer
        hlsUrl="https://example.com/video.m3u8"
        videoTitle="Test Video"
      />
    )

    const controlsBar = container.querySelector('[data-controls-bar]')
    if (controlsBar) {
      await user.click(controlsBar)
      expect(mockPlayer.play).not.toHaveBeenCalled()
    }
  })

  it('disposes player on unmount', () => {
    const { unmount } = render(
      <VideoPlayer
        hlsUrl="https://example.com/video.m3u8"
        videoTitle="Test Video"
      />
    )

    unmount()

    expect(mockPlayer.dispose).toHaveBeenCalled()
  })

  it('handles existing player disposal before creating new one', () => {
    const existingPlayer = {
      ...mockPlayer,
      dispose: jest.fn()
    }
    ;(videojs.getPlayer as jest.Mock).mockReturnValueOnce(existingPlayer)

    render(
      <VideoPlayer
        hlsUrl="https://example.com/video.m3u8"
        videoTitle="Test Video"
      />
    )

    expect(existingPlayer.dispose).toHaveBeenCalled()
  })

  it('renders video element with correct attributes', () => {
    render(
      <VideoPlayer
        hlsUrl="https://example.com/video.m3u8"
        videoTitle="Test Video"
      />
    )

    const video = document.querySelector('video')
    expect(video).toBeInTheDocument()
    expect(video).toHaveAttribute('playsInline')
    expect(video?.getAttribute('muted')).toBeDefined()
    expect(video).toHaveAttribute('preload', 'auto')
    expect(video).toHaveAttribute('crossOrigin', 'anonymous')
  })

  it('renders fallback message for browsers without JS', () => {
    render(
      <VideoPlayer
        hlsUrl="https://example.com/video.m3u8"
        videoTitle="Test Video"
      />
    )

    expect(screen.getByText(/lackOfBrowserSupport/i)).toBeInTheDocument()
  })

  it('updates onVideoEnd callback when prop changes', () => {
    const onVideoEnd1 = jest.fn()
    const onVideoEnd2 = jest.fn()

    const { rerender } = render(
      <VideoPlayer
        hlsUrl="https://example.com/video.m3u8"
        videoTitle="Test Video"
        onVideoEnd={onVideoEnd1}
      />
    )

    rerender(
      <VideoPlayer
        hlsUrl="https://example.com/video.m3u8"
        videoTitle="Test Video"
        onVideoEnd={onVideoEnd2}
      />
    )

    expect(mockPlayer.off).toHaveBeenCalledWith('ended', expect.any(Function))
    expect(mockPlayer.on).toHaveBeenCalledWith('ended', expect.any(Function))
  })
})
