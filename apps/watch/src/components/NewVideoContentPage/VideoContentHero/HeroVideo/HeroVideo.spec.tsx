import { act, render, waitFor } from '@testing-library/react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'

import { PlayerProvider } from '../../../../libs/playerContext'
import { VideoProvider } from '../../../../libs/videoContext'
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
  let mockPlayer: TestPlayer
  let requestAnimationFrameMock: jest.Mock
  let cancelAnimationFrameMock: jest.Mock
  let performanceNowSpy: jest.SpyInstance<number, []>
  let frameCallback: FrameRequestCallback | null
  const originalRequestAnimationFrame = globalWithRAF.requestAnimationFrame
  const originalCancelAnimationFrame = globalWithRAF.cancelAnimationFrame

  const renderComponent = () =>
    render(
      <VideoProvider value={{ content: videos[0] }}>
        <WatchProvider initialState={{ subtitleLanguageId: '529', subtitleOn: false }}>
          <PlayerProvider initialState={{ mute: false }}>
            <HeroVideo />
          </PlayerProvider>
        </WatchProvider>
      </VideoProvider>
    )

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
})

