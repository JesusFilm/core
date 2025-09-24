import { act, renderHook } from '@testing-library/react'

import { VideoLabel } from '../../../__generated__/globalTypes'
import type { PlayerState } from '../../libs/playerContext'
import type {
  CarouselMuxSlide,
  VideoCarouselSlide
} from '../../types/inserts'
import {
  type CarouselVideo,
  useCarouselVideos
} from '../VideoHero/libs/useCarouselVideos'

import { useWatchHeroCarousel } from './useWatchHeroCarousel'
import { usePlayer } from '../../libs/playerContext'

jest.mock('../VideoHero/libs/useCarouselVideos', () => ({
  useCarouselVideos: jest.fn()
}))

jest.mock('../../libs/playerContext', () => ({
  usePlayer: jest.fn()
}))

describe('useWatchHeroCarousel', () => {
  const useCarouselVideosMock = jest.mocked(useCarouselVideos)
  const usePlayerMock = jest.mocked(usePlayer)

  const createVideo = (overrides: Partial<CarouselVideo> = {}): CarouselVideo => ({
    id: 'video-1',
    slug: 'video-1/english',
    title: [{ value: 'Video 1' }],
    images: [{ mobileCinematicHigh: 'poster-1.jpg' }],
    imageAlt: [{ value: 'Poster 1' }],
    label: VideoLabel.shortFilm,
    variant: {
      id: 'variant-1',
      duration: 120,
      hls: 'video-1.m3u8',
      slug: 'video-1/english'
    },
    childrenCount: 0,
    ...overrides
  })

  const createMuxSlide = (id: string): CarouselMuxSlide => ({
    source: 'mux',
    id,
    overlay: {
      label: 'Staff Pick',
      title: `Mux ${id}`,
      collection: 'Highlights',
      description: 'Mux insert description'
    },
    playbackId: `playback-${id}`,
    playbackIndex: 0,
    urls: {
      hls: `https://example.com/${id}.m3u8`,
      poster: `https://example.com/${id}.jpg`
    },
    duration: 4
  })

  const muxSlideOne = createMuxSlide('welcome-start')
  const muxSlideTwo = createMuxSlide('second-insert')
  const videoOne: CarouselVideo = createVideo()
  const videoTwo: CarouselVideo = createVideo({
    id: 'video-2',
    slug: 'video-2/english',
    title: [{ value: 'Video 2' }],
    images: [{ mobileCinematicHigh: 'poster-2.jpg' }],
    imageAlt: [{ value: 'Poster 2' }],
    variant: {
      id: 'variant-2',
      duration: 140,
      hls: 'video-2.m3u8',
      slug: 'video-2/english'
    }
  })

  const muxSlides: CarouselMuxSlide[] = [muxSlideOne, muxSlideTwo]
  const videoSlides: VideoCarouselSlide[] = [
    { source: 'video', id: videoOne.id, video: videoOne },
    { source: 'video', id: videoTwo.id, video: videoTwo }
  ]

  let moveToNextMock: jest.Mock
  let jumpToVideoMock: jest.Mock
  let playerState: PlayerState

  beforeEach(() => {
    jest.useFakeTimers()

    moveToNextMock = jest.fn()
    jumpToVideoMock = jest.fn().mockReturnValue(true)

    playerState = {
      play: false,
      active: true,
      currentTime: '0:00',
      progress: 0,
      progressPercentNotYetEmitted: [10, 25, 50, 75, 90],
      volume: 0,
      mute: true,
      fullscreen: false,
      openSubtitleDialog: false,
      loadSubtitleDialog: false,
      loading: false,
      durationSeconds: 0,
      duration: '0:00'
    }

    usePlayerMock.mockReturnValue({ state: playerState })
    useCarouselVideosMock.mockReturnValue({
      slides: [...muxSlides, ...videoSlides],
      videos: [videoOne, videoTwo],
      loading: false,
      currentIndex: 0,
      error: null,
      moveToNext: moveToNextMock,
      moveToPrevious: jest.fn(),
      jumpToVideo: jumpToVideoMock,
      currentPoolIndex: 0
    })
  })

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers()
    })
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('initializes with the first slide active', () => {
    const { result } = renderHook(() => useWatchHeroCarousel())

    expect(result.current.activeVideoId).toBe(muxSlideOne.id)
    expect(result.current.currentMuxInsert).toBe(muxSlideOne)
    expect(result.current.activeVideo?.id).toBe(muxSlideOne.id)
  })

  it('advances through mux slides and into videos when inserts complete', () => {
    const { result } = renderHook(() => useWatchHeroCarousel())

    act(() => {
      result.current.handleMuxInsertComplete()
    })
    act(() => {
      jest.runOnlyPendingTimers()
    })

    expect(result.current.activeVideoId).toBe(muxSlideTwo.id)
    expect(jumpToVideoMock).not.toHaveBeenCalled()

    act(() => {
      result.current.handleMuxInsertComplete()
    })
    act(() => {
      jest.runOnlyPendingTimers()
    })

    expect(result.current.activeVideoId).toBe(videoOne.id)
    expect(result.current.currentMuxInsert).toBeNull()
    expect(jumpToVideoMock).toHaveBeenCalledWith(videoOne.id)
  })

  it('jumps to a requested video when a carousel item is selected', () => {
    const { result } = renderHook(() => useWatchHeroCarousel())

    act(() => {
      result.current.handleMuxInsertComplete()
    })
    act(() => {
      jest.runOnlyPendingTimers()
    })
    act(() => {
      result.current.handleMuxInsertComplete()
    })
    act(() => {
      jest.runOnlyPendingTimers()
    })
    jumpToVideoMock.mockClear()

    act(() => {
      result.current.handleVideoSelect(videoTwo.id)
    })

    expect(result.current.activeVideoId).toBe(videoTwo.id)
    expect(jumpToVideoMock).toHaveBeenCalledWith(videoTwo.id)
  })

  it('automatically advances when playback nears completion', () => {
    const { result, rerender } = renderHook(() => useWatchHeroCarousel())

    act(() => {
      result.current.handleMuxInsertComplete()
    })
    act(() => {
      jest.runOnlyPendingTimers()
    })
    act(() => {
      result.current.handleMuxInsertComplete()
    })
    act(() => {
      jest.runOnlyPendingTimers()
    })
    jumpToVideoMock.mockClear()

    act(() => {
      playerState = { ...playerState, progress: 96 }
      usePlayerMock.mockReturnValue({ state: playerState })
      rerender()
    })

    expect(result.current.activeVideoId).toBe(videoTwo.id)
    expect(jumpToVideoMock).toHaveBeenCalledWith(videoTwo.id)
  })
})
