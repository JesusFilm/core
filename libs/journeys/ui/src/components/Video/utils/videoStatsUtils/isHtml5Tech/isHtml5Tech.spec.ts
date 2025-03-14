import { Html5 } from '../../../utils/videoJsTypes/Html5'
import { YoutubeTech } from '../../../utils/videoJsTypes/YoutubeTech'

import { isHtml5Tech } from './isHtml5Tech'

describe('isHtml5Tech', () => {
  it('should return true for Html5 tech', () => {
    const mockHtml5Tech = { name_: 'Html5', vhs: {} } as Html5
    expect(isHtml5Tech(mockHtml5Tech)).toBe(true)
  })

  it('should return false for non-Html5 tech', () => {
    const mockYoutubeTech = { name_: 'Youtube' } as YoutubeTech
    expect(isHtml5Tech(mockYoutubeTech)).toBe(false)
  })

  it('should return false for undefined tech', () => {
    expect(isHtml5Tech(undefined as unknown as Html5)).toBe(false)
  })
})
