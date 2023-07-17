import { NextRequest, NextResponse } from 'next/server'
import { get } from '@vercel/edge-config'

export const config = {
  matcher: [
    '/((?!api/|_next/static|_next/image|[\\w-]+\\.\\w+).*)',
    // Ensure the root path is matched.
    '/'
  ]
}

export async function middleware(
  req: NextRequest
): Promise<NextResponse | undefined> {
  if (req.nextUrl.pathname.startsWith('/_next')) return
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
