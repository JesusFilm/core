import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_FILE_REGEX = /\.(.*)$/

// update the fingerprint when updating cookies logic
// update CountryLanguageSelector data file to reflect the changes
const COOKIE_FINGERPRINT = '00001'

// geo information is available on projects that is hosted on Vercel
// https://nextjs.org/docs/pages/api-reference/functions/next-request#geo
export function middleware(req: NextRequest): NextResponse | undefined {
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.includes('/api/') ||
    PUBLIC_FILE_REGEX.test(req.nextUrl.pathname)
  )
    return

  const country = req.geo?.country ?? 'unknown'
  const response = NextResponse.next()
  if (country !== 'unknown') {
    response.cookies.set('NEXT_COUNTRY', `${COOKIE_FINGERPRINT}---${country}`)
  }
  return response
}
