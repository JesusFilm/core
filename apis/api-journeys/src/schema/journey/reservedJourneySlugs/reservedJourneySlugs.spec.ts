import { isReservedJourneySlug } from './reservedJourneySlugs'

describe('isReservedJourneySlug', () => {
  it('reserves the slugs shadowed by static routes', () => {
    expect(isReservedJourneySlug('campaign')).toBe(true)
    expect(isReservedJourneySlug('embed')).toBe(true)
    expect(isReservedJourneySlug('legal')).toBe(true)
    expect(isReservedJourneySlug('template-gallery')).toBe(true)
  })

  it('allows any other slug', () => {
    expect(isReservedJourneySlug('campaign-2026')).toBe(false)
    expect(isReservedJourneySlug('my-journey')).toBe(false)
  })
})
