import { Html5 } from '../../../utils/videoJsTypes/Html5'
import { YoutubeTech } from '../../../utils/videoJsTypes/YoutubeTech'

import { isYoutubeTech } from './isYoutubeTech'

describe('isYoutubeTech', () => {
  it('should return true for Youtube tech', () => {
    const mockYoutubeTech = {
      name_: 'Youtube',
      ytPlayer: {
        getPlaybackQuality: () => '',
        getAvailableQualityLevels: () => [],
        getVideoLoadedFraction: () => 0
      }
    } as unknown as YoutubeTech
    expect(isYoutubeTech(mockYoutubeTech)).toBe(true)
  })

  it('should return false for non-Youtube tech', () => {
    const mockHtml5Tech = { name_: 'Html5', vhs: {} } as unknown as Html5
    expect(isYoutubeTech(mockHtml5Tech)).toBe(false)
  })

  it('should return false for undefined tech', () => {
    expect(isYoutubeTech(undefined as unknown as YoutubeTech)).toBe(false)
  })
})
