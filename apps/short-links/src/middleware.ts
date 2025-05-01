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

  // Only process redirects for arc.gt domain
  if (hostname === 'arc.gt' || hostname === 'stage.arc.gt') {
    if (
      pathname.startsWith('/hls/') ||
      pathname.startsWith('/dl/') ||
      pathname.startsWith('/dh/') ||
      pathname.startsWith('/s/')
    ) {
      const parts = pathname.split('/')
      if (parts.length !== 4) {
        return new NextResponse('Invalid URL format', { status: 400 })
      }

      const [, type, param1, param2] = parts

      switch (type) {
        case 'hls':
          return NextResponse.redirect(
            `https://api.arclight.org/hls/${param1}/${param2}`,
            307
          )
        case 'dl':
          return NextResponse.redirect(
            `https://api.arclight.org/dl/${param1}/${param2}`
          )
        case 'dh':
          return NextResponse.redirect(
            `https://api.arclight.org/dh/${param1}/${param2}`
          )
        case 's':
          return NextResponse.redirect(
            `https://api.arclight.org/s/${param1}/${param2}`
          )
      }
    }
  }

  // For all other cases, rewrite the URL
  const url = new URL(`/${hostname}${pathname}`, request.url)
  return NextResponse.rewrite(url)
}
