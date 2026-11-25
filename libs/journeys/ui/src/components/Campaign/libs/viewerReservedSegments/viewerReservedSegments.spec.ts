import { VIEWER_RESERVED_SEGMENTS } from './viewerReservedSegments'

// api-journeys' reservedJourneySlugs.spec ties the rest of the set to the viewer's folders, routes and locales.
describe('VIEWER_RESERVED_SEGMENTS', () => {
  it('reserves _next, which no API check reaches since a slug can never hold it', () => {
    expect(VIEWER_RESERVED_SEGMENTS.has('_next')).toBe(true)
  })
})
