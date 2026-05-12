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
  if (
    isDevHost(hostname) &&
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
