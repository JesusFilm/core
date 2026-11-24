import { VIEWER_RESERVED_SEGMENTS } from '@core/journeys/ui/Campaign/libs/viewerReservedSegments'

/**
 * Whether a journey slug is a first path segment the viewer owns on a domain
 * root. `VIEWER_RESERVED_SEGMENTS` (`@core/journeys/ui`) is the one list the
 * viewer's region matcher, journey slugs and campaign region slugs
 * (`REGION_RESERVED_SLUGS`) all reserve against.
 * `reservedJourneySlugs.spec.ts` checks it against the viewer's folders and
 * locales so it cannot drift silently.
 */
export function isReservedJourneySlug(slug: string): boolean {
  return VIEWER_RESERVED_SEGMENTS.has(slug)
}
