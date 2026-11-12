import { NextRequest, NextResponse } from 'next/server'

// The module by its deep path: the `@core/journeys/ui/Campaign` barrel would
// pull React and MUI into this edge middleware.
import {
  LANGUAGE_PAGE_SEGMENT,
  languagePagePath,
  pageLanguageTag
} from '@core/journeys/ui/Campaign/libs/campaignAddress'
import { isDevHost } from '@core/shared/dev-hosts'

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
    '/'
  ]
}

/**
 * The campaign pages are statically generated, so the Page Language the URL
 * names (`?lang=`) is part of the path they are generated at: `_lang/<tag>`
 * ahead of the optional region (`languagePagePath`), the query kept.
 * `segments` are the public path's segments after the campaign prefix; the
 * route answers a tag that is not one of the campaign's languages with a
 * redirect to the plain page.
 */
function rewriteToLanguage(
  req: NextRequest,
  prefix: string,
  segments: string[],
  languageTag: string
): NextResponse {
  return NextResponse.rewrite(
    new URL(
      `${languagePagePath(prefix, segments, languageTag)}${req.nextUrl.search}`,
      req.url
    )
  )
}

export default async function proxy(
  req: NextRequest
): Promise<NextResponse | undefined> {
  const url = req.nextUrl

  if (url.pathname.startsWith('/plausible')) return

  // A `_lang` page is reached only through the `?lang=` rewrite below; a
  // public path naming one is not found, on any host. Answered here, so the
  // status does not depend on how Next handles a rewrite to `/404`.
  const segments = url.pathname.split('/').filter((segment) => segment !== '')
  if (segments.includes(LANGUAGE_PAGE_SEGMENT))
    return NextResponse.rewrite(new URL('/404', req.url), { status: 404 })

  // Get hostname of request
  // (e.g. your.nextstep.is, localhost:4100, example.com)
  let hostname = req.headers.get('host') ?? ''

  // special case for Vercel preview deployment URLs
  if (
    process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX != null &&
    process.env.NEXT_PUBLIC_ROOT_DOMAIN != null &&
    hostname.endsWith(process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX)
  ) {
    hostname = process.env.NEXT_PUBLIC_ROOT_DOMAIN
  }

  // dev-only: when the request hits one of the developer hostnames listed
  // in `NEXT_PUBLIC_DEV_HOSTS` (Doppler dev config), treat it as the root
  // domain so cross-device testing resolves to `/home` instead of the
  // catch-all `/[hostname]/[slug]` route. The secret is only set in dev's
  // Doppler config, so `isDevHost` returns false everywhere else — absence
  // of the secret IS the gate. See docs/development/tailscale-dev-access.md.
  //
  // Strip the port before matching: browsers send `Host: tailscale-dev-x:4100`
  // but Doppler `DEV_HOSTS` stores bare FQDNs (matching the other call sites
  // — apolloClient/QrCodeDialog read `window.location.hostname`, which has
  // no port; getAuthTokens does the same `.split(':')[0]`).
  if (
    isDevHost(hostname.split(':')[0]) &&
    process.env.NEXT_PUBLIC_ROOT_DOMAIN != null
  ) {
    hostname = process.env.NEXT_PUBLIC_ROOT_DOMAIN
  }

  const searchParams = req.nextUrl.searchParams.toString()
  // Get the pathname of the request (e.g. /, /about, /blog/first-post)
  const path = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ''
  }`

  // Template-gallery pages are root-domain-only by design (NES-1644):
  // custom domains never host them, so the path itself is authoritative.
  // Always rewrite to `/home/template-gallery/...` regardless of hostname —
  // otherwise dev hosts (and any hostname that isn't NEXT_PUBLIC_ROOT_DOMAIN
  // and isn't in NEXT_PUBLIC_DEV_HOSTS) fall through to the `/[hostname]/
  // [journeySlug]` catch-all and 404, since that route is for journeys on
  // custom domains, not template-gallery slugs.
  if (url.pathname.startsWith('/template-gallery/')) {
    return NextResponse.rewrite(new URL(`/home${path}`, req.url))
  }

  const isRootDomain =
    process.env.NEXT_PUBLIC_ROOT_DOMAIN != null &&
    hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN

  // The root-domain Campaign Address `/campaign/<slug>…` resolves on the root
  // domain only (dev hosts and Vercel previews count as root, above). A
  // Campaign Domain serves only its own campaign, at its root (#10026), so on
  // any other host the path falls through to the hostname routes and is not
  // found. On the root domain it serves only a campaign with no Campaign
  // Domain. A `lang` value worth a page of its own is a bcp47-shaped tag
  // (`pageLanguageTag`); anything else is served the plain page. Each
  // distinct tag does mint a `_lang/<tag>` page path: a server render, an
  // uncached `campaignPublic` read and a 60 s ISR entry (a language fallback
  // is cached too). That is what requesting a random journey slug costs, so
  // tags are not limited.
  const languageTag = pageLanguageTag(url.searchParams.get('lang'))

  if (isRootDomain && url.pathname.startsWith('/campaign/')) {
    const [, slug, ...region] = segments
    if (languageTag != null && slug != null && region.length <= 1)
      return rewriteToLanguage(
        req,
        `/home/campaign/${slug}`,
        region,
        languageTag
      )
    return NextResponse.rewrite(new URL(`/home${path}`, req.url))
  }

  // rewrite root application to `/home` folder
  if (isRootDomain) {
    return NextResponse.rewrite(
      new URL(`/home${path === '/' ? '' : path}`, req.url)
    )
  }

  // a Campaign Domain's landing page or region (or a journey slug, which the
  // route sends back to the plain path) in the Page Language the URL names
  if (languageTag != null && segments.length <= 1)
    return rewriteToLanguage(req, `/${hostname}`, segments, languageTag)

  // rewrite everything else to `/[hostname]/[slug] dynamic route
  return NextResponse.rewrite(new URL(`/${hostname}${path}`, req.url))
}
