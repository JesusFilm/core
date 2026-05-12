import { NextRequest, NextResponse } from 'next/server'

/**
 * Matches a Tailscale MagicDNS host (lowercase letters, digits, hyphens,
 * optional port). No dots — so `tailscale-evil.attacker.com` cannot
 * smuggle through. Mirrored from
 * apps/journeys-admin/src/libs/tailscaleHostPattern; Nx forbids cross-`apps/`
 * imports, so the constant is duplicated rather than shared.
 */
const TAILSCALE_HOST_PATTERN = /^tailscale-[a-z0-9-]+(:\d+)?$/i

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

  // dev-only: treat any `tailscale-*` MagicDNS hostname as the root domain
  // so cross-device testing over Tailscale resolves to `/home` instead of
  // the catch-all `/[hostname]/[slug]` route. Strictly gated on NODE_ENV.
  // See docs/development/tailscale-dev-access.md for setup.
  if (
    process.env.NODE_ENV !== 'production' &&
    TAILSCALE_HOST_PATTERN.test(hostname) &&
    process.env.NEXT_PUBLIC_ROOT_DOMAIN != null
  ) {
    hostname = process.env.NEXT_PUBLIC_ROOT_DOMAIN
  }

  const searchParams = req.nextUrl.searchParams.toString()
  // Get the pathname of the request (e.g. /, /about, /blog/first-post)
  const path = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ''
  }`

  // rewrite root application to `/home` folder
  if (
    process.env.NEXT_PUBLIC_ROOT_DOMAIN != null &&
    hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN
  ) {
    return NextResponse.rewrite(
      new URL(`/home${path === '/' ? '' : path}`, req.url)
    )
  }

  // rewrite everything else to `/[hostname]/[slug] dynamic route
  return NextResponse.rewrite(new URL(`/${hostname}${path}`, req.url))
}
