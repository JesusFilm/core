import { VIEWER_RESERVED_SEGMENTS } from '@core/journeys/ui/Campaign/libs/viewerReservedSegments'

/**
 * The first path segments the viewer owns on a domain root, shared with the
 * viewer's region matcher (`@core/journeys/ui`). This is the one list both
 * sides reserve against: a journey slug (`isReservedJourneySlug`) and a
 * campaign region slug (`REGION_RESERVED_SLUGS`).
 * `reservedJourneySlugs.spec.ts` checks it against the viewer's folders and
 * locales so it cannot drift silently.
 */
export { VIEWER_RESERVED_SEGMENTS }

export function isReservedJourneySlug(slug: string): boolean {
  return VIEWER_RESERVED_SEGMENTS.has(slug)
}
