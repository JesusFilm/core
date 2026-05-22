import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import noop from 'lodash/lodash'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'
import type { MockedFunction } from 'vitest'

import { ContainerHeroVideo } from './ContainerHeroVideo'

vi.mock('video.js', async () => {
  const originalModule =
    await vi.importActual<typeof import('video.js')>('video.js')

  const mockPlayer = {
    on: vi.fn(),
    play: vi.fn().mockReturnValue(Promise.resolve()),
    pause: vi.fn(),
    muted: vi.fn(),
    dispose: vi.fn(),
    src: vi.fn()
  }

  const mockVideoJs = vi.fn(() => mockPlayer)

  return {
    ...originalModule,
    __esModule: true,
    default: mockVideoJs
  }
})

const mockVideoJs = videojs as MockedFunction<typeof videojs>

describe('ContainerHeroVideo', () => {
  const mockOnMutedChange = vi.fn()
  const mockOnPlayerReady = vi.fn()
  let mockPlayer: Partial<Player>

  // Cache original values
  const originalScrollY = Object.getOwnPropertyDescriptor(window, 'scrollY')
  const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect

  beforeEach(() => {
    vi.clearAllMocks()

    mockPlayer = {
      on: vi.fn(),
      play: vi.fn().mockReturnValue(Promise.resolve()),
      pause: vi.fn(),
      muted: vi.fn(),
      dispose: vi.fn(),
      src: vi.fn()
    }

    mockVideoJs.mockImplementation(() => mockPlayer as Player)

    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 0,
      writable: true
    })

    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 1200,
      height: 800,
      top: 0,
      left: 0,
      bottom: 800,
      right: 1200,
      x: 0,
      y: 0,
      toJSON: () => noop
    }))
  })

  afterEach(() => {
    Object.defineProperty(
      window,
      'scrollY',
      originalScrollY as PropertyDescriptor
    )
    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect

    vi.restoreAllMocks()
  })

  it('should render correctly with video element', () => {
    render(
      <ContainerHeroVideo
        onMutedChange={mockOnMutedChange}
        onPlayerReady={mockOnPlayerReady}
      />
    )

    const videoContainer = screen.getByTestId('ContainerHeroVideo')
    expect(videoContainer).toBeInTheDocument()
    expect(videoContainer).toHaveClass('fixed top-0 left-0 right-0')

    const videoElement = screen.getByTestId('ContainerHeroVideoApplication')
    expect(videoElement).toBeInTheDocument()
    expect(videoElement).toHaveClass('video-js')

    const sourceElement = screen.getByTestId('ContainerHeroVideoSource')
    expect(sourceElement).toBeInTheDocument()
    expect(sourceElement).toHaveAttribute('type', 'application/x-mpegURL')
    expect(sourceElement).toHaveAttribute(
      'src',
      expect.stringContaining('mux.com')
    )
  })

  it('should initialize video.js with correct options', () => {
    render(
      <ContainerHeroVideo
        onMutedChange={mockOnMutedChange}
        onPlayerReady={mockOnPlayerReady}
      />
    )

    expect(mockVideoJs).toHaveBeenCalledTimes(1)
    expect(mockVideoJs).toHaveBeenCalledWith(
      expect.any(Element),
      expect.objectContaining({
        autoplay: true,
        controls: false,
        loop: true,
        muted: true,
        fluid: false,
        fill: true
      })
    )
  })

  it('should call onPlayerReady when player is initialized', () => {
    render(
      <ContainerHeroVideo
        onMutedChange={mockOnMutedChange}
        onPlayerReady={mockOnPlayerReady}
      />
    )

    expect(mockOnPlayerReady).toHaveBeenCalledTimes(1)
    expect(mockOnPlayerReady).toHaveBeenCalledWith(expect.any(Object))
  })

  it('should register volumechange event to sync muted state', () => {
    render(
      <ContainerHeroVideo
        onMutedChange={mockOnMutedChange}
        onPlayerReady={mockOnPlayerReady}
      />
    )

    expect(mockPlayer.on).toHaveBeenCalledWith(
      'volumechange',
      expect.any(Function)
    )
  })

  it('should add scroll event listener that pauses video when scrolling away', async () => {
    const { unmount } = render(
      <ContainerHeroVideo
        onMutedChange={mockOnMutedChange}
        onPlayerReady={mockOnPlayerReady}
      />
    )

    // Simulate scrolling down
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 600,
      writable: true
    })

    fireEvent.scroll(window)
    await waitFor(() => {
      expect(mockPlayer.pause).toHaveBeenCalledTimes(1)
    })

    // Simulate scrolling back to top
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 0,
      writable: true
    })

    fireEvent.scroll(window)
    await waitFor(() => {
      expect(mockPlayer.play).toHaveBeenCalledTimes(1)
    })

    // Test cleanup
    unmount()
  })

  it('should dispose the player when component unmounts', () => {
    const { unmount } = render(
      <ContainerHeroVideo
        onMutedChange={mockOnMutedChange}
        onPlayerReady={mockOnPlayerReady}
      />
    )

    unmount()
    expect(mockPlayer.dispose).toHaveBeenCalledTimes(1)
  })
})
