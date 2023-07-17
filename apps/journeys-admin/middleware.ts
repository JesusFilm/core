import { NextRequest, NextResponse } from 'next/server'
import { get } from '@vercel/edge-config'

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|site.webmanifest|favicon-16x16.png).*)',
    '/'
  ]
}

export async function middleware(
  req: NextRequest
): Promise<NextResponse | undefined> {
  let maintenanceMode = false
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
