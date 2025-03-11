import { TFunction } from 'next-i18next'

import { YoutubeTech } from '../../../utils/videoJsTypes/YoutubeTech'

import { getYoutubeStats } from './getYoutubeStats'

// Mock the youtubeQualityMap module
jest.mock('../../../utils/youtubeQualityMap', () => ({
  getYoutubeQualityMap: jest.fn().mockImplementation(() => ({
    hd720: '720p',
    hd1080: '1080p',
    medium: '360p',
    small: '240p'
  }))
}))

describe('getYoutubeStats', () => {
  it('should return YouTube stats with quality and buffered percent', () => {
    const mockYtPlayer = {
      getPlaybackQuality: jest.fn().mockReturnValue('hd720'),
      getVideoLoadedFraction: jest.fn().mockReturnValue(0.75)
    }

    const mockTech = {
      ytPlayer: mockYtPlayer
    } as unknown as YoutubeTech

    const mockTranslate = jest.fn((key) => key) as unknown as TFunction

    const result = getYoutubeStats(mockTech, mockTranslate)

    expect(result).toEqual({
      currentQuality: '720p',
      bufferedPercent: 75
    })
  })

  it('should handle missing ytPlayer', () => {
    const mockTech = {} as YoutubeTech

    const mockTranslate = jest.fn((key) => key) as unknown as TFunction

    const result = getYoutubeStats(mockTech, mockTranslate)

    expect(result).toEqual({
      currentQuality: '-',
      bufferedPercent: 0
    })
  })

  it('should handle unknown quality value', () => {
    const mockYtPlayer = {
      getPlaybackQuality: jest.fn().mockReturnValue('unknown'),
      getVideoLoadedFraction: jest.fn().mockReturnValue(0.5)
    }

    const mockTech = {
      ytPlayer: mockYtPlayer
    } as unknown as YoutubeTech

    const mockTranslate = jest.fn((key) => key) as unknown as TFunction

    const result = getYoutubeStats(mockTech, mockTranslate)

    expect(result).toEqual({
      currentQuality: 'unknown',
      bufferedPercent: 50
    })
  })
})
