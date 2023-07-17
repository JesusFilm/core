import { NextRequest, NextResponse } from 'next/server'
import { get } from '@vercel/edge-config'

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (Next static content)
     * 5. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api/|_next/|_static/|[\\w-]+\\.\\w+).*)',
    // Ensure the root path is matched.
    '/'
  ]
}

export async function middleware(
  req: NextRequest
): Promise<NextResponse | undefined> {
  let maintenanceMode = true
  try {
    maintenanceMode = (await get('maintenanceMode')) ?? maintenanceMode
  } catch {}
  if (maintenanceMode && !req.nextUrl.pathname.startsWith('/maintenance')) {
    const url = req.nextUrl.clone()
    url.pathname = '/maintenance'
    return NextResponse.redirect(url)
  } else if (
    !maintenanceMode &&
    req.nextUrl.pathname.startsWith('/maintenance')
  ) {
    const url = req.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }
}
