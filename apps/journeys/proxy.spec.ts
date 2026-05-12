import { NextRequest } from 'next/server'

import proxy from './proxy'

describe('journeys proxy', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  function buildRequest(host: string, path = '/'): NextRequest {
    const url = new URL(path, `http://${host}`)
    const request = new Request(url.toString(), {
      headers: new Headers({ host })
    })
    return new NextRequest(request)
  }

  it('rewrites root domain requests to /home', async () => {
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'localhost:4100'
    const result = await proxy(buildRequest('localhost:4100', '/'))

    expect(result?.headers.get('x-middleware-rewrite')).toBe(
      'http://localhost:4100/home'
    )
  })

  it('rewrites non-root-domain requests to /[hostname][path]', async () => {
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'localhost:4100'
    const result = await proxy(
      buildRequest('custom.example.com', '/my-journey')
    )

    expect(result?.headers.get('x-middleware-rewrite')).toBe(
      'http://custom.example.com/custom.example.com/my-journey'
    )
  })

  describe('Vercel preview deployment', () => {
    it('treats deployment-suffix hosts as the root domain', async () => {
      process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'your.nextstep.is'
      process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX = '-jesusfilm.vercel.app'
      const result = await proxy(
        buildRequest('preview-abc-jesusfilm.vercel.app', '/')
      )

      expect(result?.headers.get('x-middleware-rewrite')).toBe(
        'http://preview-abc-jesusfilm.vercel.app/home'
      )
    })
  })

  describe('tailscale hostname (dev)', () => {
    beforeEach(() => {
      ;(process.env as Record<string, string>).NODE_ENV = 'development'
      process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'localhost:4100'
    })

    it('rewrites tailscale-* host to /home in dev', async () => {
      const result = await proxy(buildRequest('tailscale-mbp-siyang:4100', '/'))

      expect(result?.headers.get('x-middleware-rewrite')).toBe(
        'http://tailscale-mbp-siyang:4100/home'
      )
    })

    it('rewrites uppercase tailscale-* host to /home (case-insensitive)', async () => {
      const result = await proxy(buildRequest('TAILSCALE-MBP-SIYANG:4100', '/'))

      expect(result?.headers.get('x-middleware-rewrite')).toBe(
        'http://tailscale-mbp-siyang:4100/home'
      )
    })

    it('preserves path and query when rewriting to /home', async () => {
      const result = await proxy(
        buildRequest('tailscale-mbp:4100', '/dashboard?ref=phone')
      )

      expect(result?.headers.get('x-middleware-rewrite')).toBe(
        'http://tailscale-mbp:4100/home/dashboard?ref=phone'
      )
    })

    it('does NOT short-circuit non-tailscale hosts', async () => {
      const result = await proxy(buildRequest('tailscaleother.com', '/foo'))

      // No trailing hyphen → falls through to /[hostname][path]
      expect(result?.headers.get('x-middleware-rewrite')).toBe(
        'http://tailscaleother.com/tailscaleother.com/foo'
      )
    })
  })

  describe('tailscale hostname (production gate)', () => {
    it('does NOT short-circuit tailscale-* in production', async () => {
      ;(process.env as Record<string, string>).NODE_ENV = 'production'
      process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'your.nextstep.is'
      const result = await proxy(buildRequest('tailscale-mbp-siyang:4100', '/'))

      // Falls through to /[hostname][path] — no Tailscale shortcut in prod
      expect(result?.headers.get('x-middleware-rewrite')).toBe(
        'http://tailscale-mbp-siyang:4100/tailscale-mbp-siyang:4100/'
      )
    })
  })

  it('returns undefined for /plausible paths', async () => {
    const result = await proxy(
      buildRequest('localhost:4100', '/plausible/script.js')
    )

    expect(result).toBeUndefined()
  })
})
