import { VIEWER_RESERVED_SEGMENTS } from '../viewerReservedSegments'

/**
 * Resolve `/<segment>` on a Campaign Domain to a region of the root
 * campaign, listed or orphan alike. Null means "not a region": the caller
 * falls through to the journey lookup, so a region outranks a journey with
 * the same slug and everything else behaves as it does today. A segment the
 * viewer owns (`VIEWER_RESERVED_SEGMENTS`) is never a region, so a stale or
 * hand-built region list cannot shadow a viewer route.
 */
export function matchRegionSlug<T extends { slug: string }>(
  segment: string | null | undefined,
  regions: readonly T[]
): T | null {
  if (segment == null || segment === '') return null
  if (VIEWER_RESERVED_SEGMENTS.has(segment)) return null
  return regions.find((region) => region.slug === segment) ?? null
}
