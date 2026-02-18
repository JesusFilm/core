import { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'

import { showLogoSection } from './showLogoSection'

describe('showLogoSection', () => {
  it('returns true when logoImageBlock is customizable', () => {
    const journey = {
      logoImageBlock: { customizable: true }
    } as unknown as Journey
    expect(showLogoSection(journey)).toBe(true)
  })

  it('returns false when logoImageBlock is not customizable', () => {
    const journey = {
      logoImageBlock: { customizable: false }
    } as unknown as Journey
    expect(showLogoSection(journey)).toBe(false)
  })

  it('returns false when logoImageBlock.customizable is null', () => {
    const journey = {
      logoImageBlock: { customizable: null }
    } as unknown as Journey
    expect(showLogoSection(journey)).toBe(false)
  })

  it('returns false when logoImageBlock is null', () => {
    const journey = {
      logoImageBlock: null
    } as unknown as Journey
    expect(showLogoSection(journey)).toBe(false)
  })

  it('returns false when journey is undefined', () => {
    expect(showLogoSection(undefined)).toBe(false)
  })
})
