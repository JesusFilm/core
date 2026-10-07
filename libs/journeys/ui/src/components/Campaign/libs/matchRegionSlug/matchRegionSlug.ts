/**
 * The first path segments the viewer owns on a domain root. A region slug can
 * never equal one (the API reserves them), and the matcher refuses them so a
 * stale or hand-built region list cannot shadow a viewer route.
 */
export const VIEWER_OWNED_SEGMENTS: ReadonlySet<string> = new Set([
  'embed',
  'legal',
  'plausible',
  'campaign',
  'template-gallery',
  'api',
  '_next'
])

/**
 * Resolve `/<segment>` on a Campaign Root domain to a region of the root
 * campaign, listed or orphan alike. Null means "not a region": the caller
 * falls through to the journey lookup, so a region outranks a journey with
 * the same slug and everything else behaves as it does today.
 */
export function matchRegionSlug<T extends { slug: string }>(
  segment: string | null | undefined,
  regions: readonly T[]
): T | null {
  if (segment == null || segment === '') return null
  if (VIEWER_OWNED_SEGMENTS.has(segment)) return null
  return regions.find((region) => region.slug === segment) ?? null
}
