/**
 * The first path segments the viewer owns on a domain root. The static folders
 * under `apps/journeys/pages/home/` win over `home/[journeySlug]/`, the proxy
 * rewrites `/campaign/…` and `/template-gallery/…` on every host, and `/api`,
 * `/_next` and `/plausible` never reach the journey route. This is the one
 * list both sides reserve against: a journey slug (`isReservedJourneySlug`)
 * and a campaign region slug (`REGION_RESERVED_SLUGS`).
 */
export const VIEWER_RESERVED_SEGMENTS: ReadonlySet<string> = new Set([
  'embed',
  'legal',
  'plausible',
  'campaign',
  'template-gallery',
  'api',
  '_next'
])

export function isReservedJourneySlug(slug: string): boolean {
  return VIEWER_RESERVED_SEGMENTS.has(slug)
}
