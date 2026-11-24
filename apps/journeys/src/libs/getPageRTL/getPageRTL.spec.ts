import type { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'

import { getPageRTL } from './getPageRTL'

describe('getPageRTL', () => {
  it('follows the Page Language of a campaign page', () => {
    expect(getPageRTL({ campaign: { language: { bcp47: 'ar' } } })).toBe(true)
    expect(getPageRTL({ campaign: { language: { bcp47: 'he-IL' } } })).toBe(
      true
    )
    expect(getPageRTL({ campaign: { language: { bcp47: 'en' } } })).toBe(false)
  })

  it('follows the journey language of a journey page', () => {
    const journey = { language: { bcp47: 'ar' } } as unknown as Journey
    expect(getPageRTL({ journey })).toBe(true)
  })

  it('is left-to-right without a campaign language or a journey', () => {
    expect(getPageRTL({})).toBe(false)
    expect(getPageRTL({ campaign: { language: { bcp47: null } } })).toBe(false)
  })
})
