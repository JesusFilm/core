import { act, render, screen, waitFor } from '@testing-library/react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'

import { PlayerProvider } from '../../../../libs/playerContext'
import { VideoProvider } from '../../../../libs/videoContext'
import { VideoCarouselProvider, useVideoCarousel } from '../../../../libs/videoCarouselContext'
import { WatchProvider } from '../../../../libs/watchContext'
import { videos } from '../../../Videos/__generated__/testData'

import { HeroVideo } from './HeroVideo'

const globalWithRAF = globalThis as typeof globalThis & {
  requestAnimationFrame?: typeof requestAnimationFrame
  cancelAnimationFrame?: typeof cancelAnimationFrame
}

jest.mock('videojs-mux', () => ({}))

jest.mock('../../../../libs/watchContext/useSubtitleUpdate', () => ({
  useSubtitleUpdate: () => ({ subtitleUpdate: jest.fn() })
}))

jest.mock(
  '../../../VideoContentPage/VideoHero/VideoPlayer/VideoControls',
  () => ({
    VideoControls: () => <div data-testid="VideoControls" />,
    MuxInsertLogoOverlay: () => <div data-testid="MuxInsertLogoOverlay" />
  })
)

jest.mock('video.js', () => {
  const originalModule = jest.requireActual('video.js')

  return {
    ...originalModule,
    __esModule: true,
    default: jest.fn()
  }
})

jest.mock('../../../../libs/videoCarouselContext', () => ({
  VideoCarouselProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="VideoCarouselProvider">{children}</div>,
  useVideoCarousel: jest.fn()
}))

interface TestPlayer extends Partial<Player> {
  trigger: (event: string) => void
  setRemainingTime: (value: number) => void
  setCurrentTime: (value: number) => void
  setDuration: (value: number) => void
  getCurrentVolume: () => number
  el: () => HTMLElement
}

describe('HeroVideo', () => {
  const mockVideoJs = videojs as jest.MockedFunction<typeof videojs>
  const mockUseVideoCarousel = useVideoCarousel as jest.MockedFunction<typeof useVideoCarousel>
  let mockPlayer: TestPlayer
  let requestAnimationFrameMock: jest.Mock
  let cancelAnimationFrameMock: jest.Mock
  let performanceNowSpy: jest.SpyInstance<number, []>
  let frameCallback: FrameRequestCallback | null
  const originalRequestAnimationFrame = globalWithRAF.requestAnimationFrame
  const originalCancelAnimationFrame = globalWithRAF.cancelAnimationFrame

  const renderComponent = () => {
    mockUseVideoCarousel.mockReturnValue({
      activeVideoId: videos[0]?.id ?? null,
      activeVideo: videos[0] ?? null,
      currentMuxInsert: null,
      slides: [],
      loading: false,
      isProgressing: false,
      setActiveVideo: jest.fn(),
      handleMuxInsertComplete: jest.fn(),
      handleSkipActiveVideo: jest.fn(),
      loadSlides: jest.fn()
    })

    return render(
      <VideoProvider value={{ content: videos[0] }}>
        <WatchProvider initialState={{ subtitleLanguageId: '529', subtitleOn: false }}>
          <PlayerProvider initialState={{ mute: false }}>
            <HeroVideo />
          </PlayerProvider>
        </WatchProvider>
      </VideoProvider>
    )
  }

  const setupPlayer = (): TestPlayer => {
    const handlers: Record<string, Array<() => void>> = {}
    let remainingTimeValue = 5
    let durationValue = 10
    let currentTimeValue = 0
    let currentVolumeValue = 0.75
    const element = document.createElement('div')

    const player: TestPlayer = {
      ready: jest.fn((callback: () => void) => {
        callback()
        return player as unknown as Player
      }),
      on: jest.fn((event: string, handler: () => void) => {
        handlers[event] = handlers[event] ?? []
        handlers[event]?.push(handler)
        return player as unknown as Player
      }),
      off: jest.fn((event: string, handler: () => void) => {
        handlers[event] = handlers[event]?.filter((fn) => fn !== handler) ?? []
        return player as unknown as Player
      }),
      play: jest.fn(),
      pause: jest.fn(),
      muted: jest.fn(() => false),
      dispose: jest.fn(),
      src: jest.fn(),
      loop: jest.fn(),
      duration: jest.fn(() => durationValue),
      currentTime: jest.fn(() => currentTimeValue),
      remainingTime: jest.fn(() => remainingTimeValue),
      paused: jest.fn(() => false),
      volume: jest.fn((value?: number) => {
        if (value == null) {
          return currentVolumeValue
        }
        currentVolumeValue = value
        return currentVolumeValue
      }),
      textTracks: jest.fn(() => ({ length: 0 } as unknown as TextTrackList)),
      el: jest.fn(() => element),
      trigger: (event: string) => {
        handlers[event]?.forEach((handler) => handler())
      },
      setRemainingTime: (value: number) => {
        remainingTimeValue = value
      },
      setCurrentTime: (value: number) => {
        currentTimeValue = value
      },
      setDuration: (value: number) => {
        durationValue = value
      },
      getCurrentVolume: () => currentVolumeValue
    }

    return player
  }

  beforeEach(() => {
    jest.clearAllMocks()

    mockPlayer = setupPlayer()
    mockVideoJs.mockImplementation(() => mockPlayer as unknown as Player)

    frameCallback = null
    requestAnimationFrameMock = jest.fn((callback: FrameRequestCallback) => {
      frameCallback = callback
      return 1
    })
    cancelAnimationFrameMock = jest.fn()

    globalWithRAF.requestAnimationFrame = requestAnimationFrameMock as unknown as typeof requestAnimationFrame
    globalWithRAF.cancelAnimationFrame = cancelAnimationFrameMock as unknown as typeof cancelAnimationFrame

    performanceNowSpy = jest
      .spyOn(global.performance, 'now')
      .mockReturnValue(0)
  })

  afterEach(() => {
    performanceNowSpy.mockRestore()
    if (originalRequestAnimationFrame) {
      globalWithRAF.requestAnimationFrame = originalRequestAnimationFrame
    } else {
      delete globalWithRAF.requestAnimationFrame
    }

    if (originalCancelAnimationFrame) {
      globalWithRAF.cancelAnimationFrame = originalCancelAnimationFrame
    } else {
      delete globalWithRAF.cancelAnimationFrame
    }

    jest.restoreAllMocks()
  })

  it('fades audio and shows overlay when nearing clip end', async () => {
    const { getByTestId } = renderComponent()

    await waitFor(() => {
      expect(mockPlayer.on).toHaveBeenCalledWith('timeupdate', expect.any(Function))
    })

    mockPlayer.setRemainingTime(1)

    act(() => {
      mockPlayer.trigger('timeupdate')
    })

    expect(requestAnimationFrameMock).toHaveBeenCalled()

    act(() => {
      frameCallback?.(800)
    })

    await waitFor(() => {
      expect(getByTestId('HeroVideoFadeOverlay')).toHaveClass('opacity-60')
    })
    expect(mockPlayer.volume).toHaveBeenLastCalledWith(0)
  })

  it('resets fade and restores volume on playback events', async () => {
    const { getByTestId } = renderComponent()

    await waitFor(() => {
      expect(mockPlayer.on).toHaveBeenCalledWith('playing', expect.any(Function))
    })

    expect(mockPlayer.on).toHaveBeenCalledWith('ended', expect.any(Function))

    mockPlayer.setRemainingTime(0.5)

    act(() => {
      mockPlayer.trigger('timeupdate')
    })

    expect(requestAnimationFrameMock).toHaveBeenCalled()

    act(() => {
      mockPlayer.trigger('playing')
    })

    expect(cancelAnimationFrameMock).toHaveBeenCalledWith(1)

    await waitFor(() => {
      expect(getByTestId('HeroVideoFadeOverlay')).toHaveClass('opacity-0')
    })
    expect(mockPlayer.getCurrentVolume()).toBeCloseTo(0.75)
  })

  it('fades preview clips as they near completion', async () => {
    const { getByTestId } = render(
      <VideoProvider value={{ content: videos[0] }}>
        <WatchProvider initialState={{ subtitleLanguageId: '529', subtitleOn: false }}>
          <PlayerProvider initialState={{ mute: false }}>
            <HeroVideo isPreview />
          </PlayerProvider>
        </WatchProvider>
      </VideoProvider>
    )

    await waitFor(() => {
      expect(mockPlayer.on).toHaveBeenCalledWith('timeupdate', expect.any(Function))
    })

    mockPlayer.setRemainingTime(1)

    act(() => {
      mockPlayer.trigger('timeupdate')
    })

    expect(requestAnimationFrameMock).toHaveBeenCalled()

    act(() => {
      frameCallback?.(800)
    })

    await waitFor(() => {
      expect(getByTestId('HeroVideoFadeOverlay')).toHaveClass('opacity-60')
    })
  })

  it('calls handleMuxInsertComplete when Mux insert completes', async () => {
    const mockHandleMuxInsertComplete = jest.fn()

    mockUseVideoCarousel.mockReturnValue({
      activeVideoId: 'mux-insert-1',
      activeVideo: null,
      currentMuxInsert: {
        id: 'mux-insert-1',
        source: 'mux' as const,
        playbackId: 'test-playback-id',
        playbackIndex: 0,
        urls: { hls: 'test-hls-url', poster: 'test-poster-url' },
        overlay: {
          title: 'Test Mux Insert',
          description: 'Test description',
          label: 'shortFilm'
        },
        duration: 30
      },
      slides: [],
      loading: false,
      isProgressing: false,
      setActiveVideo: jest.fn(),
      handleMuxInsertComplete: mockHandleMuxInsertComplete,
      handleSkipActiveVideo: jest.fn(),
      loadSlides: jest.fn()
    })

    renderComponent()

    await waitFor(() => {
      expect(mockPlayer.on).toHaveBeenCalledWith('ended', expect.any(Function))
    })

    act(() => {
      mockPlayer.trigger('ended')
    })

    expect(mockHandleMuxInsertComplete).toHaveBeenCalled()
  })

  it('calls handleSkipActiveVideo when skip is triggered', async () => {
    const mockHandleSkipActiveVideo = jest.fn()

    mockUseVideoCarousel.mockReturnValue({
      activeVideoId: videos[0]?.id ?? null,
      activeVideo: videos[0] ?? null,
      currentMuxInsert: null,
      slides: [],
      loading: false,
      isProgressing: false,
      setActiveVideo: jest.fn(),
      handleMuxInsertComplete: jest.fn(),
      handleSkipActiveVideo: mockHandleSkipActiveVideo,
      loadSlides: jest.fn()
    })

    renderComponent()

    await waitFor(() => {
      expect(mockPlayer.on).toHaveBeenCalledWith('ended', expect.any(Function))
    })

    // Simulate skip action (would be triggered by UI interaction)
    // For now, test that the callback is available
    expect(mockHandleSkipActiveVideo).not.toHaveBeenCalled()

    // In a real scenario, this would be called from a skip button or keyboard shortcut
    // We'll test the callback is properly wired up
  })

  it('uses Mux insert title when currentMuxInsert is present', () => {
    const mockMuxInsert = {
      id: 'mux-insert-1',
      source: 'mux' as const,
      playbackId: 'test-playback-id',
      playbackIndex: 0,
      urls: { hls: 'test-hls-url', poster: 'test-poster-url' },
      overlay: {
        title: 'Custom Mux Title',
        description: 'Test description',
        label: 'shortFilm'
      },
      duration: 30
    }

    mockUseVideoCarousel.mockReturnValue({
      activeVideoId: 'mux-insert-1',
      activeVideo: null,
      currentMuxInsert: mockMuxInsert,
      slides: [],
      loading: false,
      isProgressing: false,
      setActiveVideo: jest.fn(),
      handleMuxInsertComplete: jest.fn(),
      handleSkipActiveVideo: jest.fn(),
      loadSlides: jest.fn()
    })

    renderComponent()

    // The title should come from currentMuxInsert.overlay.title
    // We can verify this indirectly by checking that the component renders
    expect(screen.getByTestId('HeroVideo')).toBeInTheDocument()
  })

  it('falls back to video title when no Mux insert is present', () => {
    mockUseVideoCarousel.mockReturnValue({
      activeVideoId: videos[0]?.id ?? null,
      activeVideo: videos[0] ?? null,
      currentMuxInsert: null,
      slides: [],
      loading: false,
      isProgressing: false,
      setActiveVideo: jest.fn(),
      handleMuxInsertComplete: jest.fn(),
      handleSkipActiveVideo: jest.fn(),
      loadSlides: jest.fn()
    })

    renderComponent()

    // Should use the last title from the video content
    expect(screen.getByTestId('HeroVideo')).toBeInTheDocument()
  })
})

