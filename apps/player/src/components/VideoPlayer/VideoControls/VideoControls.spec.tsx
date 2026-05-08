import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type Player from 'video.js/dist/types/player'

import { VideoControls } from '.'

import { mockPlayer } from '@/setupTests'

const player = mockPlayer as unknown as Player

describe('VideoControls', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPlayer.paused.mockReturnValue(true)
    mockPlayer.currentTime.mockReturnValue(30)
    mockPlayer.duration.mockReturnValue(120)
    mockPlayer.buffered.mockReturnValue({
      length: 1,
      start: vi.fn().mockReturnValue(0),
      end: vi.fn().mockReturnValue(60)
    })
    mockPlayer.muted.mockReturnValue(false)
    mockPlayer.volume.mockReturnValue(0.5)
    mockPlayer.isFullscreen.mockReturnValue(false)
  })

  it('renders play button when paused', () => {
    mockPlayer.paused.mockReturnValue(true)
    render(<VideoControls player={player} />)

    const playButton = screen.getByLabelText('Play')
    expect(playButton).toBeInTheDocument()
  })

  it('renders pause button when playing', () => {
    mockPlayer.paused.mockReturnValue(false)
    render(<VideoControls player={player} />)

    const pauseButton = screen.getByLabelText('Pause')
    expect(pauseButton).toBeInTheDocument()
  })

  it('toggles play/pause on button click', async () => {
    const user = userEvent.setup()
    mockPlayer.paused.mockReturnValue(true)

    render(<VideoControls player={player} />)

    const playButton = screen.getByLabelText('Play')
    await user.click(playButton)

    expect(mockPlayer.play).toHaveBeenCalled()
  })

  it('pauses video when pause button is clicked', async () => {
    const user = userEvent.setup()
    mockPlayer.paused.mockReturnValue(false)

    render(<VideoControls player={player} />)

    const pauseButton = screen.getByLabelText('Pause')
    await user.click(pauseButton)

    expect(mockPlayer.pause).toHaveBeenCalled()
  })

  it('displays current time and duration', () => {
    mockPlayer.currentTime.mockReturnValue(45)
    mockPlayer.duration.mockReturnValue(120)

    render(<VideoControls player={player} />)

    expect(screen.getByText('0:45')).toBeInTheDocument()
    expect(screen.getByText('2:00')).toBeInTheDocument()
  })

  it('formats time correctly for hours', () => {
    mockPlayer.currentTime.mockReturnValue(3661)
    mockPlayer.duration.mockReturnValue(7200)

    render(<VideoControls player={player} />)

    expect(screen.getByText('1:01:01')).toBeInTheDocument()
    expect(screen.getByText('2:00:00')).toBeInTheDocument()
  })

  it('updates progress bar based on current time', () => {
    mockPlayer.currentTime.mockReturnValue(60)
    mockPlayer.duration.mockReturnValue(120)

    const { container } = render(<VideoControls player={player} />)

    const progressBar = container.querySelector('[style*="width: 50%"]')
    expect(progressBar).toBeInTheDocument()
  })

  it('handles seek on progress bar click', async () => {
    mockPlayer.duration.mockReturnValue(120)

    const { container } = render(<VideoControls player={player} />)

    const progressBar = container.querySelector('[data-progress-bar]')
    if (progressBar) {
      const mockGetBoundingClientRect = vi.fn().mockReturnValue({
        left: 0,
        top: 0,
        width: 100,
        height: 10,
        bottom: 10,
        right: 100,
        x: 0,
        y: 0,
        toJSON: vi.fn()
      })
      progressBar.getBoundingClientRect = mockGetBoundingClientRect

      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: 50,
        clientY: 5
      })
      Object.defineProperty(clickEvent, 'currentTarget', {
        value: progressBar,
        writable: false
      })

      progressBar.dispatchEvent(clickEvent)

      await waitFor(() => {
        expect(mockPlayer.currentTime).toHaveBeenCalled()
      })
    }
  })

  it('shows hover preview on mouse move', async () => {
    mockPlayer.duration.mockReturnValue(120)

    const { container } = render(<VideoControls player={player} />)

    const progressBar = container.querySelector('[data-progress-bar]')
    if (progressBar) {
      const mockGetBoundingClientRect = vi.fn().mockReturnValue({
        left: 0,
        top: 0,
        width: 100,
        height: 10,
        bottom: 10,
        right: 100,
        x: 0,
        y: 0,
        toJSON: vi.fn()
      })
      progressBar.getBoundingClientRect = mockGetBoundingClientRect

      const mouseMoveEvent = new MouseEvent('mousemove', {
        bubbles: true,
        cancelable: true,
        clientX: 50,
        clientY: 5
      })
      Object.defineProperty(mouseMoveEvent, 'currentTarget', {
        value: progressBar,
        writable: false
      })

      progressBar.dispatchEvent(mouseMoveEvent)

      await waitFor(
        () => {
          expect(screen.queryByText('1:00')).toBeInTheDocument()
        },
        { timeout: 1000 }
      )
    }
  })

  it('hides hover preview on mouse leave', async () => {
    const user = userEvent.setup()
    mockPlayer.duration.mockReturnValue(120)

    const { container } = render(<VideoControls player={player} />)

    const progressBar = container.querySelector('[data-progress-bar]')
    if (progressBar) {
      await user.hover(progressBar)
      await user.unhover(progressBar)

      expect(screen.queryByText('1:00')).not.toBeInTheDocument()
    }
  })

  it('displays buffered progress', () => {
    mockPlayer.buffered.mockReturnValue({
      length: 1,
      start: vi.fn().mockReturnValue(0),
      end: vi.fn().mockReturnValue(60)
    })
    mockPlayer.duration.mockReturnValue(120)

    const { container } = render(<VideoControls player={player} />)

    const bufferedBar = container.querySelector('[style*="width: 50%"]')
    expect(bufferedBar).toBeInTheDocument()
  })

  it('toggles mute on mute button click', async () => {
    const user = userEvent.setup()
    mockPlayer.muted.mockReturnValue(false)

    render(<VideoControls player={player} />)

    const muteButton = screen.getByLabelText('Mute')
    await user.click(muteButton)

    expect(mockPlayer.muted).toHaveBeenCalledWith(true)
  })

  it('shows muted icon when muted', () => {
    mockPlayer.muted.mockReturnValue(true)

    render(<VideoControls player={player} />)

    const unmuteButton = screen.getByLabelText('Unmute')
    expect(unmuteButton).toBeInTheDocument()
  })

  it('shows unmuted icon when not muted', () => {
    mockPlayer.muted.mockReturnValue(false)
    mockPlayer.volume.mockReturnValue(0.5)

    render(<VideoControls player={player} />)

    const muteButton = screen.getByLabelText('Mute')
    expect(muteButton).toBeInTheDocument()
  })

  it('toggles fullscreen on fullscreen button click', async () => {
    const user = userEvent.setup()
    mockPlayer.isFullscreen.mockReturnValue(false)

    render(<VideoControls player={player} />)

    const fullscreenButton = screen.getByLabelText('Enter fullscreen')
    await user.click(fullscreenButton)

    expect(mockPlayer.requestFullscreen).toHaveBeenCalled()
  })

  it('exits fullscreen when in fullscreen mode', async () => {
    const user = userEvent.setup()
    mockPlayer.isFullscreen.mockReturnValue(true)

    render(<VideoControls player={player} />)

    const exitFullscreenButton = screen.getByLabelText('Exit fullscreen')
    await user.click(exitFullscreenButton)

    expect(mockPlayer.exitFullscreen).toHaveBeenCalled()
  })

  it('hides controls after timeout when playing', async () => {
    vi.useFakeTimers()
    try {
      mockPlayer.paused.mockReturnValue(false)

      const { container } = render(<VideoControls player={player} />)

      const controlsWrapper = container.querySelector('.mt-auto.px-4')
      expect(controlsWrapper).toHaveClass('opacity-100')

      await act(async () => {
        await vi.advanceTimersByTimeAsync(2500)
      })

      const updatedControlsWrapper = container.querySelector('.mt-auto.px-4')
      expect(updatedControlsWrapper).toHaveClass('opacity-0')
    } finally {
      vi.useRealTimers()
    }
  })

  it('shows controls when paused', async () => {
    vi.useFakeTimers()
    try {
      mockPlayer.paused.mockReturnValue(true)

      const { container } = render(<VideoControls player={player} />)

      const controlsWrapper = container.querySelector('.mt-auto.px-4')
      expect(controlsWrapper).toHaveClass('opacity-100')

      vi.advanceTimersByTime(2500)
      await Promise.resolve()

      const updatedControlsWrapper = container.querySelector('.mt-auto.px-4')
      expect(updatedControlsWrapper).toHaveClass('opacity-100')
    } finally {
      vi.useRealTimers()
    }
  })

  it('shows controls on mouse move', async () => {
    vi.useFakeTimers()
    try {
      mockPlayer.paused.mockReturnValue(false)

      const { container } = render(<VideoControls player={player} />)

      vi.advanceTimersByTime(2500)
      await Promise.resolve()

      const controlsContainer = container.querySelector('[data-video-controls]')
      if (controlsContainer) {
        const mouseMoveEvent = new MouseEvent('mousemove', {
          bubbles: true,
          cancelable: true
        })
        controlsContainer.dispatchEvent(mouseMoveEvent)
        await Promise.resolve()

        const controlsWrapper = container.querySelector('.mt-auto.px-4')
        expect(controlsWrapper).toHaveClass('opacity-100')
      }
    } finally {
      vi.useRealTimers()
    }
  })

  it('shows play/pause icon on video click', async () => {
    vi.useFakeTimers()
    mockPlayer.paused.mockReturnValue(true)

    const { container } = render(<VideoControls player={player} />)

    const videoContainer = container.querySelector('[data-video-controls]')
    if (videoContainer) {
      const div = document.createElement('div')
      div.className = 'test-div'
      videoContainer.appendChild(div)

      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true
      })
      Object.defineProperty(clickEvent, 'target', {
        value: div,
        writable: false,
        configurable: true
      })
      Object.defineProperty(clickEvent, 'currentTarget', {
        value: videoContainer,
        writable: false,
        configurable: true
      })

      videoContainer.dispatchEvent(clickEvent)
      await Promise.resolve()
      vi.advanceTimersByTime(100)
      await Promise.resolve()

      const iconContainer =
        container.querySelector('.flex.h-24.w-24') ||
        container.querySelector('.pointer-events-none.absolute.inset-0')
      expect(iconContainer).toBeTruthy()
    }
    vi.useRealTimers()
  })

  it('listens to player events', () => {
    render(<VideoControls player={player} />)

    expect(mockPlayer.on).toHaveBeenCalledWith(
      'timeupdate',
      expect.any(Function)
    )
    expect(mockPlayer.on).toHaveBeenCalledWith(
      'durationchange',
      expect.any(Function)
    )
    expect(mockPlayer.on).toHaveBeenCalledWith('play', expect.any(Function))
    expect(mockPlayer.on).toHaveBeenCalledWith('pause', expect.any(Function))
    expect(mockPlayer.on).toHaveBeenCalledWith(
      'volumechange',
      expect.any(Function)
    )
    expect(mockPlayer.on).toHaveBeenCalledWith(
      'fullscreenchange',
      expect.any(Function)
    )
  })

  it('cleans up event listeners on unmount', () => {
    const { unmount } = render(<VideoControls player={player} />)

    unmount()

    expect(mockPlayer.off).toHaveBeenCalledWith(
      'timeupdate',
      expect.any(Function)
    )
    expect(mockPlayer.off).toHaveBeenCalledWith(
      'durationchange',
      expect.any(Function)
    )
    expect(mockPlayer.off).toHaveBeenCalledWith('play', expect.any(Function))
    expect(mockPlayer.off).toHaveBeenCalledWith('pause', expect.any(Function))
    expect(mockPlayer.off).toHaveBeenCalledWith(
      'volumechange',
      expect.any(Function)
    )
    expect(mockPlayer.off).toHaveBeenCalledWith(
      'fullscreenchange',
      expect.any(Function)
    )
  })

  it('handles null player gracefully', () => {
    const { container } = render(<VideoControls player={null} />)
    expect(container.firstChild).toBeInTheDocument()
  })
})
