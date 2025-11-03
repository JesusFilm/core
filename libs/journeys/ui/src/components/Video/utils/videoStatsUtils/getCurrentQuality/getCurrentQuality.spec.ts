import { TFunction } from 'next-i18next'

import { isHtml5Tech } from '../isHtml5Tech'
import { isYoutubeTech } from '../isYoutubeTech'

import { getCurrentQuality } from './getCurrentQuality'

// Mock the dependencies
jest.mock('../isHtml5Tech')
jest.mock('../isYoutubeTech')
jest.mock('../../../utils/youtubeQualityMap', () => ({
  getYoutubeQualityMap: jest.fn().mockImplementation(() => ({
    small: '240p',
    medium: '360p',
    large: '480p',
    hd720: '720p',
    hd1080: '1080p',
    highres: '1440p+',
    default: 'Auto'
  }))
}))

describe('getCurrentQuality', () => {
  // Mock player and tech
  const mockPlayer = {
    tech: jest.fn(),
    qualityLevels: jest.fn()
  } as any

  const mockHtml5Tech = {
    name_: 'Html5'
  }

  const mockYoutubeTech = {
    name_: 'Youtube',
    ytPlayer: {
      getPlaybackQuality: jest.fn()
    }
  }

  const mockedIsYoutubeTech = isYoutubeTech as jest.MockedFunction<
    typeof isYoutubeTech
  >
  const mockedIsHtml5Tech = isHtml5Tech as jest.MockedFunction<
    typeof isHtml5Tech
  >
  // Use type assertion to satisfy the TFunction type
  const mockT = jest.fn((key) => key) as unknown as TFunction

  beforeEach(() => {
    jest.clearAllMocks()
    mockPlayer.tech.mockReturnValue(mockHtml5Tech)
  })

  it('should return "-" if player is not provided', () => {
    expect(getCurrentQuality({ player: undefined, t: mockT })).toBe('-')
  })

  it('should return "-" if tech is not available', () => {
    mockPlayer.tech.mockReturnValue(null)
    expect(getCurrentQuality({ player: mockPlayer, t: mockT })).toBe('-')
  })

  describe('YouTube videos', () => {
    beforeEach(() => {
      mockPlayer.tech.mockReturnValue(mockYoutubeTech)
      mockedIsYoutubeTech.mockReturnValue(true)
      mockedIsHtml5Tech.mockReturnValue(false)
    })

    it('should return "-" if ytPlayer is not available', () => {
      mockPlayer.tech.mockReturnValue({ name_: 'Youtube' })
      expect(getCurrentQuality({ player: mockPlayer, t: mockT })).toBe('-')
    })

    it('should return mapped quality for YouTube videos', () => {
      mockYoutubeTech.ytPlayer.getPlaybackQuality.mockReturnValue('hd720')
      expect(getCurrentQuality({ player: mockPlayer, t: mockT })).toBe('720p')
    })

    it('should return the original quality if not in the map', () => {
      mockYoutubeTech.ytPlayer.getPlaybackQuality.mockReturnValue('unknown')
      expect(getCurrentQuality({ player: mockPlayer, t: mockT })).toBe(
        'unknown'
      )
    })

    it('should return "Auto" for default quality', () => {
      mockYoutubeTech.ytPlayer.getPlaybackQuality.mockReturnValue('default')
      expect(getCurrentQuality({ player: mockPlayer, t: mockT })).toBe('Auto')
    })
  })

  describe('HTML5 videos', () => {
    beforeEach(() => {
      mockedIsYoutubeTech.mockReturnValue(false)
      mockedIsHtml5Tech.mockReturnValue(true)
    })

    it('should return "-" if qualityLevels is not available', () => {
      mockPlayer.qualityLevels.mockReturnValue(null)
      expect(getCurrentQuality({ player: mockPlayer, t: mockT })).toBe('-')
    })

    it('should return "-" if qualityLevels is empty', () => {
      mockPlayer.qualityLevels.mockReturnValue({ length: 0 })
      expect(getCurrentQuality({ player: mockPlayer, t: mockT })).toBe('-')
    })

    it('should return "-" if selectedIndex is invalid', () => {
      mockPlayer.qualityLevels.mockReturnValue({
        length: 3,
        selectedIndex: -1
      })
      expect(getCurrentQuality({ player: mockPlayer, t: mockT })).toBe('-')
    })

    it('should return the quality with height for HTML5 videos', () => {
      mockPlayer.qualityLevels.mockReturnValue({
        length: 3,
        selectedIndex: 1,
        1: { height: 720 }
      })
      expect(getCurrentQuality({ player: mockPlayer, t: mockT })).toBe('720p')
    })

    it('should return "-" if selected level is not available', () => {
      mockPlayer.qualityLevels.mockReturnValue({
        length: 3,
        selectedIndex: 1,
        1: null
      })
      expect(getCurrentQuality({ player: mockPlayer, t: mockT })).toBe('-')
    })
  })

  it('should return "-" for unknown tech types', () => {
    mockedIsYoutubeTech.mockReturnValue(false)
    mockedIsHtml5Tech.mockReturnValue(false)
    expect(getCurrentQuality({ player: mockPlayer, t: mockT })).toBe('-')
  })
})
