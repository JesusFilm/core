/**
 * Journey slugs that would be shadowed by a static route. A journey lives at
 * `/<journeySlug>/<stepSlug>`, but on the root domain the static folders
 * under `apps/journeys/pages/home/` win over `home/[journeySlug]/`, and the
 * proxy rewrites `/campaign/…` and `/template-gallery/…` on every host. A
 * journey with one of these slugs would lose its step links.
 */
export const RESERVED_JOURNEY_SLUGS: ReadonlySet<string> = new Set([
  'campaign',
  'embed',
  'legal',
  'template-gallery'
])

export function isReservedJourneySlug(slug: string): boolean {
  return RESERVED_JOURNEY_SLUGS.has(slug)
}
