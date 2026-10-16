import { VIEWER_OWNED_SEGMENTS, matchRegionSlug } from './matchRegionSlug'

describe('matchRegionSlug', () => {
  const regions = [
    { id: 'eur', slug: 'europe', listed: true },
    { id: 'afr', slug: 'africa', listed: false }
  ]

  it('matches a listed region slug', () => {
    expect(matchRegionSlug('europe', regions)).toBe(regions[0])
  })

  it('matches an orphan region slug', () => {
    expect(matchRegionSlug('africa', regions)).toBe(regions[1])
  })

  it('resolves to nothing for a segment that is not a region, so the journey lookup runs', () => {
    expect(matchRegionSlug('my-journey', regions)).toBeNull()
  })

  it('resolves to nothing without a segment or without regions', () => {
    expect(matchRegionSlug(undefined, regions)).toBeNull()
    expect(matchRegionSlug(null, regions)).toBeNull()
    expect(matchRegionSlug('', regions)).toBeNull()
    expect(matchRegionSlug('europe', [])).toBeNull()
  })

  it('is an exact, case-sensitive match', () => {
    expect(matchRegionSlug('Europe', regions)).toBeNull()
    expect(matchRegionSlug('euro', regions)).toBeNull()
  })

  it.each([...VIEWER_OWNED_SEGMENTS])(
    'never matches the viewer-owned segment %s',
    (segment) => {
      expect(matchRegionSlug(segment, [{ slug: segment }])).toBeNull()
    }
  )
})
