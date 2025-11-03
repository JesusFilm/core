import VideoJsPlayer from '../videoJsTypes'
import { Html5 } from '../videoJsTypes/Html5'
import { YoutubeTech } from '../videoJsTypes/YoutubeTech'
import { isYoutubeTech } from '../videoStatsUtils/isYoutubeTech'

import { getYouTubePlayer } from './getYouTubePlayer'

jest.mock('../videoStatsUtils/isYoutubeTech')

const mockIsYoutubeTech = isYoutubeTech as jest.MockedFunction<
  typeof isYoutubeTech
>

describe('getYouTubePlayer', () => {
  let mockPlayer: VideoJsPlayer
  let mockTech: YoutubeTech | Html5
  let mockYtPlayer: any

  beforeEach(() => {
    jest.clearAllMocks()

    mockYtPlayer = {
      getOption: jest.fn(),
      loadModule: jest.fn(),
      setOption: jest.fn(),
      getPlaybackQuality: jest.fn(),
      getAvailableQualityLevels: jest.fn(),
      getVideoLoadedFraction: jest.fn()
    }

    mockTech = {
      name_: 'Youtube',
      ytPlayer: mockYtPlayer
    } as YoutubeTech

    mockPlayer = {
      tech: jest.fn(() => mockTech)
    } as unknown as VideoJsPlayer
  })

  it('should return ytPlayer when tech is YouTube tech', () => {
    mockIsYoutubeTech.mockReturnValue(true)

    const result = getYouTubePlayer(mockPlayer)

    expect(mockPlayer.tech).toHaveBeenCalled()
    expect(mockIsYoutubeTech).toHaveBeenCalledWith(mockTech)
    expect(result).toBe(mockYtPlayer)
  })

  it('should return null when tech is not YouTube tech', () => {
    mockIsYoutubeTech.mockReturnValue(false)

    const result = getYouTubePlayer(mockPlayer)

    expect(mockPlayer.tech).toHaveBeenCalled()
    expect(mockIsYoutubeTech).toHaveBeenCalledWith(mockTech)
    expect(result).toBeNull()
  })

  it('should return null when tech is null', () => {
    mockPlayer.tech = jest.fn(() => null as any)
    mockIsYoutubeTech.mockReturnValue(false)

    const result = getYouTubePlayer(mockPlayer)

    expect(mockPlayer.tech).toHaveBeenCalled()
    expect(mockIsYoutubeTech).toHaveBeenCalledWith(null)
    expect(result).toBeNull()
  })

  it('should return null when tech is undefined', () => {
    mockPlayer.tech = jest.fn(() => undefined as any)
    mockIsYoutubeTech.mockReturnValue(false)

    const result = getYouTubePlayer(mockPlayer)

    expect(mockPlayer.tech).toHaveBeenCalled()
    expect(mockIsYoutubeTech).toHaveBeenCalledWith(undefined)
    expect(result).toBeNull()
  })

  it('should handle Html5 tech correctly', () => {
    const html5Tech: Html5 = {
      name_: 'Html5',
      vhs: {
        bandwidth: 1000,
        streamBitrate: 500
      }
    } as Html5

    mockPlayer.tech = jest.fn(() => html5Tech)
    mockIsYoutubeTech.mockReturnValue(false)

    const result = getYouTubePlayer(mockPlayer)

    expect(mockPlayer.tech).toHaveBeenCalled()
    expect(mockIsYoutubeTech).toHaveBeenCalledWith(html5Tech)
    expect(result).toBeNull()
  })

  it('should return ytPlayer when tech has ytPlayer property', () => {
    const youtubeTechWithYtPlayer: YoutubeTech = {
      name_: 'Youtube',
      ytPlayer: mockYtPlayer
    } as YoutubeTech

    mockPlayer.tech = jest.fn(() => youtubeTechWithYtPlayer)
    mockIsYoutubeTech.mockReturnValue(true)

    const result = getYouTubePlayer(mockPlayer)

    expect(mockPlayer.tech).toHaveBeenCalled()
    expect(mockIsYoutubeTech).toHaveBeenCalledWith(youtubeTechWithYtPlayer)
    expect(result).toBe(mockYtPlayer)
  })

  it('should handle tech with null ytPlayer', () => {
    const youtubeTechWithNullYtPlayer: YoutubeTech = {
      name_: 'Youtube',
      ytPlayer: null as any
    } as YoutubeTech

    mockPlayer.tech = jest.fn(() => youtubeTechWithNullYtPlayer)
    mockIsYoutubeTech.mockReturnValue(true)

    const result = getYouTubePlayer(mockPlayer)

    expect(mockPlayer.tech).toHaveBeenCalled()
    expect(mockIsYoutubeTech).toHaveBeenCalledWith(youtubeTechWithNullYtPlayer)
    expect(result).toBeNull()
  })

  it('should handle tech with undefined ytPlayer', () => {
    const youtubeTechWithUndefinedYtPlayer: YoutubeTech = {
      name_: 'Youtube',
      ytPlayer: undefined as any
    } as YoutubeTech

    mockPlayer.tech = jest.fn(() => youtubeTechWithUndefinedYtPlayer)
    mockIsYoutubeTech.mockReturnValue(true)

    const result = getYouTubePlayer(mockPlayer)

    expect(mockPlayer.tech).toHaveBeenCalled()
    expect(mockIsYoutubeTech).toHaveBeenCalledWith(
      youtubeTechWithUndefinedYtPlayer
    )
    expect(result).toBeUndefined()
  })
})
