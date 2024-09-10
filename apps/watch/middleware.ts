import { NextRequest, NextResponse } from 'next/server'

const COOKIE_FINGERPRINT = '00001'

export function middleware(req: NextRequest): NextResponse | undefined {
  const country = req.geo?.country ?? 'unknown'
  const response = NextResponse.next()
  if (country !== 'unknown') {
    response.cookies.set('NEXT_COUNTRY', `${COOKIE_FINGERPRINT}---${country}`)
  }
  return response
}
