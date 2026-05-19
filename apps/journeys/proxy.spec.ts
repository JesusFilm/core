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

  describe('dev hostname (NEXT_PUBLIC_DEV_HOSTS)', () => {
    const DEV_HOSTS_JSON = JSON.stringify({
      siyang: 'tailscale-dev-siyang.taila2a609.ts.net',
      mike: 'tailscale-dev-mike.taila2a609.ts.net'
    })

    beforeEach(() => {
      process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'localhost:4100'
      process.env.NEXT_PUBLIC_DEV_HOSTS = DEV_HOSTS_JSON
    })

    it('rewrites a host listed in NEXT_PUBLIC_DEV_HOSTS to /home', async () => {
      const result = await proxy(
        buildRequest('tailscale-dev-siyang.taila2a609.ts.net', '/')
      )

      expect(result?.headers.get('x-middleware-rewrite')).toBe(
        'http://tailscale-dev-siyang.taila2a609.ts.net/home'
      )
    })

    it('rewrites a port-bearing dev host to /home (browsers send Host: <fqdn>:<port>)', async () => {
      // The Host header from a real browser includes the port the dev server
      // listens on (4100). The Doppler `DEV_HOSTS` list stores bare FQDNs.
      // proxy.ts must strip the port before consulting `isDevHost`, otherwise
      // the lookup misses and the request falls through to the catch-all
      // `/[hostname]/[slug]` route — the bug Ed flagged on r3231489594.
      const result = await proxy(
        buildRequest('tailscale-dev-siyang.taila2a609.ts.net:4100', '/')
      )

      expect(result?.headers.get('x-middleware-rewrite')).toBe(
        'http://tailscale-dev-siyang.taila2a609.ts.net:4100/home'
      )
    })

    it('preserves path and query when rewriting to /home', async () => {
      const result = await proxy(
        buildRequest(
          'tailscale-dev-mike.taila2a609.ts.net',
          '/dashboard?ref=phone'
        )
      )

      expect(result?.headers.get('x-middleware-rewrite')).toBe(
        'http://tailscale-dev-mike.taila2a609.ts.net/home/dashboard?ref=phone'
      )
    })

    it('does NOT short-circuit hosts not in NEXT_PUBLIC_DEV_HOSTS', async () => {
      const result = await proxy(buildRequest('tailscaleother.com', '/foo'))

      // Not listed → falls through to /[hostname][path]
      expect(result?.headers.get('x-middleware-rewrite')).toBe(
        'http://tailscaleother.com/tailscaleother.com/foo'
      )
    })

    it('does NOT short-circuit spoofed hosts not in NEXT_PUBLIC_DEV_HOSTS', async () => {
      const result = await proxy(
        buildRequest('tailscale-evil.attacker.com:4100', '/foo')
      )

      // Not in the allow-list → falls through to /[hostname][path], not /home
      expect(result?.headers.get('x-middleware-rewrite')).toBe(
        'http://tailscale-evil.attacker.com:4100/tailscale-evil.attacker.com:4100/foo'
      )
    })
  })

  describe('dev hostname (gating)', () => {
    it('does NOT short-circuit when NEXT_PUBLIC_DEV_HOSTS is unset', async () => {
      delete process.env.NEXT_PUBLIC_DEV_HOSTS
      process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'your.nextstep.is'
      const result = await proxy(
        buildRequest('tailscale-dev-siyang.taila2a609.ts.net', '/')
      )

      // Absence of the secret IS the gate — falls through to /[hostname][path]
      expect(result?.headers.get('x-middleware-rewrite')).toBe(
        'http://tailscale-dev-siyang.taila2a609.ts.net/tailscale-dev-siyang.taila2a609.ts.net/'
      )
    })

    it('does NOT short-circuit when NEXT_PUBLIC_DEV_HOSTS is empty', async () => {
      process.env.NEXT_PUBLIC_DEV_HOSTS = ''
      process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'your.nextstep.is'
      const result = await proxy(
        buildRequest('tailscale-dev-siyang.taila2a609.ts.net', '/')
      )

      expect(result?.headers.get('x-middleware-rewrite')).toBe(
        'http://tailscale-dev-siyang.taila2a609.ts.net/tailscale-dev-siyang.taila2a609.ts.net/'
      )
    })

    it('does NOT short-circuit when NEXT_PUBLIC_DEV_HOSTS is malformed JSON', async () => {
      process.env.NEXT_PUBLIC_DEV_HOSTS = '{not valid json'
      process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'your.nextstep.is'
      const result = await proxy(
        buildRequest('tailscale-dev-siyang.taila2a609.ts.net', '/')
      )

      expect(result?.headers.get('x-middleware-rewrite')).toBe(
        'http://tailscale-dev-siyang.taila2a609.ts.net/tailscale-dev-siyang.taila2a609.ts.net/'
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
