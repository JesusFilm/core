import { NextRequest, NextResponse } from 'next/server'

import { setAuthCookies } from '../../src/libs/setAuthCookies'

export const config = {
  runtime: 'edge'
}

export default async function handler(
  req: NextRequest,
  res: NextResponse
): Promise<Response> {
  try {
    const { cookies, options } = await setAuthCookies(req, res, {})
    const cookiesString = cookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ')
    const cookieOptions: string[] = []
    if (options.httpOnly) cookieOptions.push('HttpOnly')
    if (options.maxAge.length > 0)
      cookieOptions.push(`Max-Age=${options.maxAge}`)
    if (options.path.length > 0) cookieOptions.push(`Path=${options.path}`)
    if (options.secure) cookieOptions.push('Secure')
    if (options.sameSite.length > 0)
      cookieOptions.push(`SameSite=${options.sameSite}`)
    const setCookie = [cookiesString]
    if (cookieOptions.length > 0) {
      setCookie.push(cookieOptions.join('; '))
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Set-Cookie': setCookie.join('; ')
      }
    })
  } catch (e) {
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
  }
}
