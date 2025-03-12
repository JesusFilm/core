import VideoJsPlayer from '../../../utils/videoJsTypes'

import { getHtml5FrameRate } from './getHtml5FrameRate'

describe('getHtml5FrameRate', () => {
  let mockPlayer: VideoJsPlayer
  let mockVideoElement: HTMLVideoElement

  beforeEach(() => {
    mockVideoElement = document.createElement('video')

    mockPlayer = {
      el: jest.fn().mockReturnValue({
        querySelector: jest.fn().mockReturnValue(mockVideoElement)
      }),
      currentTime: jest.fn().mockReturnValue(10)
    } as unknown as VideoJsPlayer
  })

  it('should return "No video element" if video element is not found', () => {
    mockPlayer.el = jest.fn().mockReturnValue({
      querySelector: jest.fn().mockReturnValue(null)
    })

    expect(getHtml5FrameRate(mockPlayer)).toBe('No video element')
  })

  it('should return "Buffering..." if current time is 0', () => {
    mockPlayer.currentTime = jest.fn().mockReturnValue(0)

    expect(getHtml5FrameRate(mockPlayer)).toBe('Buffering...')
  })

  it('should calculate frame rate using getVideoPlaybackQuality if available', () => {
    const mockQuality = { totalVideoFrames: 300 }
    ;(mockVideoElement as any).getVideoPlaybackQuality = jest
      .fn()
      .mockReturnValue(mockQuality)

    // 300 frames / 10 seconds = 30 fps
    expect(getHtml5FrameRate(mockPlayer)).toBe(30)
  })

  it('should calculate frame rate using webkitDecodedFrameCount if available', () => {
    ;(mockVideoElement as any).webkitDecodedFrameCount = 200

    // 200 frames / 10 seconds = 20 fps
    expect(getHtml5FrameRate(mockPlayer)).toBe(20)
  })

  it('should calculate frame rate using mozParsedFrames if available', () => {
    ;(mockVideoElement as any).mozParsedFrames = 250

    // 250 frames / 10 seconds = 25 fps
    expect(getHtml5FrameRate(mockPlayer)).toBe(25)
  })

  it('should return "Not available" if no frame count method is available', () => {
    expect(getHtml5FrameRate(mockPlayer)).toBe('Not available')
  })
})
