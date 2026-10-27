import { NextRequest, NextResponse } from 'next/server'

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

// A `lang` value worth a page of its own: a bcp47-shaped tag. Anything else
// is served the plain page, so a junk value cannot mint cache entries.
const LANGUAGE_TAG_PATTERN = /^[a-z]{2,3}(-[a-z0-9]{2,8}){0,3}$/

/**
 * The campaign pages are statically generated, so the Page Language the URL
 * names (`?lang=`) is part of the path they are generated at: `_lang/<tag>`
 * ahead of the optional region. `segments` are the public path's segments
 * after the campaign prefix; the route answers a tag that is not one of the
 * campaign's languages with a redirect to the plain page.
 */
function languagePath(prefix: string, segments: string[], tag: string): string {
  return [prefix, '_lang', tag, ...segments].join('/')
}

export default async function proxy(
  req: NextRequest
): Promise<NextResponse | undefined> {
  const url = req.nextUrl

  if (url.pathname.startsWith('/plausible')) return

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

  // Campaign pages resolve on every host (PRD §8): a campaign is always
  // reachable at its root-domain address `/campaign/<slug>…`, on a custom
  // domain and on a dev host alike, so the same prefix rewrite applies.
  const lang = url.searchParams.get('lang')?.toLowerCase() ?? ''
  const language = LANGUAGE_TAG_PATTERN.test(lang) ? lang : null
  const segments = url.pathname.split('/').filter((segment) => segment !== '')

  if (url.pathname.startsWith('/campaign/')) {
    const [, slug, ...region] = segments
    if (language != null && slug != null && region.length <= 1)
      return NextResponse.rewrite(
        new URL(
          `${languagePath(`/home/campaign/${slug}`, region, language)}${url.search}`,
          req.url
        )
      )
    return NextResponse.rewrite(new URL(`/home${path}`, req.url))
  }

  // rewrite root application to `/home` folder
  if (
    process.env.NEXT_PUBLIC_ROOT_DOMAIN != null &&
    hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN
  ) {
    return NextResponse.rewrite(
      new URL(`/home${path === '/' ? '' : path}`, req.url)
    )
  }

  // a Campaign Domain's landing page or region (or a journey slug, which the
  // route sends back to the plain path) in the Page Language the URL names
  if (language != null && segments.length <= 1)
    return NextResponse.rewrite(
      new URL(
        `${languagePath(`/${hostname}`, segments, language)}${url.search}`,
        req.url
      )
    )

  // rewrite everything else to `/[hostname]/[slug] dynamic route
  return NextResponse.rewrite(new URL(`/${hostname}${path}`, req.url))
}
