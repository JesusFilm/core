import {
  VIEWER_RESERVED_SEGMENTS,
  isReservedJourneySlug
} from './reservedJourneySlugs'

describe('isReservedJourneySlug', () => {
  it('reserves every first path segment the viewer owns', () => {
    for (const segment of [
      'embed',
      'legal',
      'plausible',
      'campaign',
      'template-gallery',
      'api',
      '_next'
    ]) {
      expect(VIEWER_RESERVED_SEGMENTS.has(segment)).toBe(true)
      expect(isReservedJourneySlug(segment)).toBe(true)
    }
  })

  it('allows any other slug', () => {
    expect(isReservedJourneySlug('campaign-2026')).toBe(false)
    expect(isReservedJourneySlug('my-journey')).toBe(false)
  })
})
