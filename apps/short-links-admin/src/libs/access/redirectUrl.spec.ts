// @vitest-environment node
import { NextRequest } from 'next/server'

import { BASE_PATH } from '../basePath'

import { getRedirectUrl } from './redirectUrl'

function makeRequest(
  url: string,
  headers: Record<string, string> = {}
): NextRequest {
  return new NextRequest(url, {
    headers,
    nextConfig: { basePath: BASE_PATH }
  })
}

describe('getRedirectUrl', () => {
  it('sees app paths without the base path and redirects with it', () => {
    const req = makeRequest('http://localhost:4800/s/dashboard/domains/abc')

    expect(req.nextUrl.pathname).toBe('/domains/abc')
    expect(getRedirectUrl(req, '/links').toString()).toBe(
      'http://localhost:4800/s/dashboard/links'
    )
  })

  it('drops the query-less path cleanly for the sign-in page', () => {
    const req = makeRequest('http://localhost:4800/s/dashboard')

    expect(req.nextUrl.pathname).toBe('/')
    expect(getRedirectUrl(req, '/users/sign-in').toString()).toBe(
      'http://localhost:4800/s/dashboard/users/sign-in'
    )
  })

  it('uses the forwarded host and protocol behind the edge proxy', () => {
    const req = makeRequest(
      'https://short-links-admin.vercel.app/s/dashboard/links',
      { 'x-forwarded-host': 'jesus.film', 'x-forwarded-proto': 'https' }
    )

    expect(getRedirectUrl(req, '/users/unauthorized').toString()).toBe(
      'https://jesus.film/s/dashboard/users/unauthorized'
    )
  })

  it('does not carry the request port over to the forwarded host', () => {
    const req = makeRequest('http://localhost:4800/s/dashboard/links', {
      'x-forwarded-host': 'jesus.film',
      'x-forwarded-proto': 'https'
    })

    expect(getRedirectUrl(req, '/links').toString()).toBe(
      'https://jesus.film/s/dashboard/links'
    )
  })
})
