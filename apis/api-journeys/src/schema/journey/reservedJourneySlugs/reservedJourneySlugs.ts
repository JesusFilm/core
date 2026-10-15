/**
 * The first path segments the viewer owns on a domain root. The static folders
 * under `apps/journeys/pages/home/` win over `home/[journeySlug]/`, the proxy
 * rewrites `/campaign/…` and `/template-gallery/…` on every host, `/api` and
 * `/plausible` never reach the journey route, and Next strips a leading i18n
 * locale (`/fr`, `/zh-hans-cn`) before routing, so each locale in
 * `apps/journeys/next-i18next.config.js` is listed in its slugified form.
 * (`/_next` is not listed: slugs are slugified, which strips the underscore,
 * so it could never match.) This is the one list both sides reserve against:
 * a journey slug (`isReservedJourneySlug`) and a campaign region slug
 * (`REGION_RESERVED_SLUGS`). `reservedJourneySlugs.spec.ts` checks it against
 * the viewer's folders and locales so it cannot drift silently.
 */
export const VIEWER_RESERVED_SEGMENTS: ReadonlySet<string> = new Set([
  'embed',
  'legal',
  'plausible',
  'campaign',
  'template-gallery',
  'api',
  'en',
  'es',
  'fr',
  'id',
  'th',
  'ja',
  'ko',
  'ru',
  'tr',
  'zh',
  'zh-hans-cn'
])

export function isReservedJourneySlug(slug: string): boolean {
  return VIEWER_RESERVED_SEGMENTS.has(slug)
}
