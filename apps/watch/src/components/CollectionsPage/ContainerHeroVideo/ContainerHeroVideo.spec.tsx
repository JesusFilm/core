import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import noop from 'lodash/lodash'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'

import { ContainerHeroVideo } from './ContainerHeroVideo'

jest.mock('video.js', () => {
  const originalModule = jest.requireActual('video.js')

  const mockPlayer = {
    on: jest.fn(),
    play: jest.fn().mockReturnValue(Promise.resolve()),
    pause: jest.fn(),
    muted: jest.fn(),
    dispose: jest.fn(),
    src: jest.fn()
  }

  const mockVideoJs = jest.fn(() => mockPlayer)

  return {
    ...originalModule,
    __esModule: true,
    default: mockVideoJs
  }
})

const mockVideoJs = videojs as jest.MockedFunction<typeof videojs>

describe('ContainerHeroVideo', () => {
  const mockOnMutedChange = jest.fn()
  const mockOnPlayerReady = jest.fn()
  let mockPlayer: Partial<Player>

  // Cache original values
  const originalScrollY = Object.getOwnPropertyDescriptor(window, 'scrollY')
  const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect

  beforeEach(() => {
    jest.clearAllMocks()

    mockPlayer = {
      on: jest.fn(),
      play: jest.fn().mockReturnValue(Promise.resolve()),
      pause: jest.fn(),
      muted: jest.fn(),
      dispose: jest.fn(),
      src: jest.fn()
    }

    mockVideoJs.mockImplementation(() => mockPlayer as Player)

    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 0,
      writable: true
    })

    Element.prototype.getBoundingClientRect = jest.fn(() => ({
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

    jest.restoreAllMocks()
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
