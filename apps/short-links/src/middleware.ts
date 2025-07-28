import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'
  ]
}

export function middleware(request: NextRequest) {
  const hostname = request.nextUrl.hostname
  const pathname = request.nextUrl.pathname

  let baseUrl = ''
  if (hostname === 'arc.gt' || hostname === 'core.arc.gt') {
    baseUrl = 'https://api.arclight.org'
  } else if (hostname === 'stg.arc.gt') {
    baseUrl = 'https://core-stage.arclight.org'
  }

  // Redirect all requests for arc.gt and stg.arc.gt
  if (baseUrl !== '') {
    const redirectUrl = `${baseUrl}${pathname}${request.nextUrl.search}`
    const response = NextResponse.redirect(redirectUrl, 302)
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', '*')
    response.headers.set('Access-Control-Expose-Headers', '*')
    return response
  }

  const url = new URL(`/${hostname}${pathname}`, request.url)
  return NextResponse.rewrite(url)
}
