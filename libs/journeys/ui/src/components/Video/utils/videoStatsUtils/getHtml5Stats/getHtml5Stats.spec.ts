import VideoJsPlayer from '../../../utils/videoJsTypes'

import { getHtml5Stats } from './getHtml5Stats'

// Mock the dependencies
jest.mock('../calculateHtml5Bitrate', () => ({
  calculateHtml5Bitrate: jest.fn().mockReturnValue(1500)
}))

jest.mock('../getHtml5CurrentQuality', () => ({
  getHtml5CurrentQuality: jest.fn().mockReturnValue('720p')
}))

jest.mock('../getHtml5FrameRate', () => ({
  getHtml5FrameRate: jest.fn().mockReturnValue(30)
}))

describe('getHtml5Stats', () => {
  let mockPlayer: VideoJsPlayer

  beforeEach(() => {
    // Create a mock player
    mockPlayer = {} as VideoJsPlayer
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return HTML5 stats with bitrate, quality, and frame rate', () => {
    const result = getHtml5Stats(mockPlayer)

    expect(result).toEqual({
      measuredBitrate: 1500,
      currentQuality: '720p',
      currentFrameRate: 30
    })
  })

  it('should handle missing bitrate by returning "-"', () => {
    // Mock calculateHtml5Bitrate to return 0
    const { calculateHtml5Bitrate } = require('../calculateHtml5Bitrate')
    ;(calculateHtml5Bitrate as jest.Mock).mockReturnValueOnce(0)

    const result = getHtml5Stats(mockPlayer)

    expect(result.measuredBitrate).toBe('-')
  })

  it('should handle missing quality by returning "-"', () => {
    // Mock getHtml5CurrentQuality to return empty string
    const { getHtml5CurrentQuality } = require('../getHtml5CurrentQuality')
    ;(getHtml5CurrentQuality as jest.Mock).mockReturnValueOnce('')

    const result = getHtml5Stats(mockPlayer)

    expect(result.currentQuality).toBe('-')
  })

  it('should handle missing frame rate by returning "-"', () => {
    // Mock getHtml5FrameRate to return empty string
    const { getHtml5FrameRate } = require('../getHtml5FrameRate')
    ;(getHtml5FrameRate as jest.Mock).mockReturnValueOnce('')

    const result = getHtml5Stats(mockPlayer)

    expect(result.currentFrameRate).toBe('-')
  })
})
