/**
 * The first path segments the viewer owns on a domain root: the one list the
 * API reserves against (a journey slug, a campaign region slug) and the
 * viewer's region matcher refuses. The static folders under
 * `apps/journeys/pages/home/` win over `home/[journeySlug]/`, the proxy
 * rewrites `/campaign/…` and `/template-gallery/…` on every host, `/api`,
 * `/plausible` and `/_next` never reach the journey route, and Next strips a
 * leading i18n locale (`/fr`, `/zh-hans-cn`) before routing, so each locale in
 * `apps/journeys/next-i18next.config.js` is listed in its slugified form.
 * (`_next` can never be a slug, since slugify strips the underscore; it is
 * listed so a stale or hand-built region list cannot shadow it in the
 * viewer.) `reservedJourneySlugs.spec.ts` in api-journeys checks it against
 * the viewer's folders and locales so it cannot drift silently.
 */
export const VIEWER_RESERVED_SEGMENTS: ReadonlySet<string> = new Set([
  'embed',
  'legal',
  'plausible',
  'campaign',
  'template-gallery',
  'api',
  '_next',
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
