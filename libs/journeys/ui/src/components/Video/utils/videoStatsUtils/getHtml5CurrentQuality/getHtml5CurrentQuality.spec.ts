import VideoJsPlayer from '../../../utils/videoJsTypes'

import { getHtml5CurrentQuality } from './getHtml5CurrentQuality'

describe('getHtml5CurrentQuality', () => {
  it('should return the current quality in the format "heightp"', () => {
    const mockQualityLevel = { height: 720 }
    const mockQualityLevels = {
      length: 3,
      selectedIndex: 1,
      1: mockQualityLevel
    }

    const mockPlayer = {
      qualityLevels: jest.fn().mockReturnValue(mockQualityLevels)
    } as unknown as VideoJsPlayer

    expect(getHtml5CurrentQuality(mockPlayer)).toBe('720p')
  })

  it('should return "-" if player is not provided', () => {
    expect(getHtml5CurrentQuality(undefined)).toBe('-')
  })

  it('should return "-" if no quality levels are available', () => {
    const mockPlayer = {
      qualityLevels: jest.fn().mockReturnValue({ length: 0 })
    } as unknown as VideoJsPlayer

    expect(getHtml5CurrentQuality(mockPlayer)).toBe('-')
  })

  it('should return "-" if no quality level is selected', () => {
    const mockQualityLevels = {
      length: 3,
      selectedIndex: -1
    }

    const mockPlayer = {
      qualityLevels: jest.fn().mockReturnValue(mockQualityLevels)
    } as unknown as VideoJsPlayer

    expect(getHtml5CurrentQuality(mockPlayer)).toBe('-')
  })

  it('should return "-" if selected quality level is undefined', () => {
    const mockQualityLevels = {
      length: 3,
      selectedIndex: 1,
      1: undefined
    }

    const mockPlayer = {
      qualityLevels: jest.fn().mockReturnValue(mockQualityLevels)
    } as unknown as VideoJsPlayer

    expect(getHtml5CurrentQuality(mockPlayer)).toBe('-')
  })
})
