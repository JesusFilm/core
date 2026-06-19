import { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'

import { showLogoSection } from './showLogoSection'

describe('showLogoSection', () => {
  it('returns true when website is true and logoImageBlock is customizable', () => {
    const journey = {
      website: true,
      logoImageBlock: { customizable: true }
    } as unknown as Journey
    expect(showLogoSection(journey)).toBe(true)
  })

  it('returns false when website is false and logoImageBlock is customizable', () => {
    const journey = {
      website: false,
      logoImageBlock: { customizable: true }
    } as unknown as Journey
    expect(showLogoSection(journey)).toBe(false)
  })

  it('returns false when website is null and logoImageBlock is customizable', () => {
    const journey = {
      website: null,
      logoImageBlock: { customizable: true }
    } as unknown as Journey
    expect(showLogoSection(journey)).toBe(false)
  })

  it('returns false when website is true and logoImageBlock is not customizable', () => {
    const journey = {
      website: true,
      logoImageBlock: { customizable: false }
    } as unknown as Journey
    expect(showLogoSection(journey)).toBe(false)
  })

  it('returns false when logoImageBlock.customizable is null', () => {
    const journey = {
      website: true,
      logoImageBlock: { customizable: null }
    } as unknown as Journey
    expect(showLogoSection(journey)).toBe(false)
  })

  it('returns false when logoImageBlock is null', () => {
    const journey = {
      website: true,
      logoImageBlock: null
    } as unknown as Journey
    expect(showLogoSection(journey)).toBe(false)
  })

  it('returns false when journey is undefined', () => {
    expect(showLogoSection(undefined)).toBe(false)
  })
})
