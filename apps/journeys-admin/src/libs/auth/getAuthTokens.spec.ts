import { GetServerSidePropsContext } from 'next'

import { isAllowedRedirectHost, redirectToApp } from './getAuthTokens'

describe('isAllowedRedirectHost', () => {
  const originalEnv = process.env
  const DEV_HOSTS_JSON = JSON.stringify({
    siyang: 'tailscale-dev-siyang.taila2a609.ts.net'
  })

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.NEXT_PUBLIC_DEV_HOSTS
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('allows known hosts regardless of NEXT_PUBLIC_DEV_HOSTS', () => {
    expect(isAllowedRedirectHost('localhost:4200')).toBe(true)
    expect(isAllowedRedirectHost('admin.nextstep.is')).toBe(true)
    expect(isAllowedRedirectHost('admin-stage.nextstep.is')).toBe(true)
  })

  it('allows a host listed in NEXT_PUBLIC_DEV_HOSTS', () => {
    process.env.NEXT_PUBLIC_DEV_HOSTS = DEV_HOSTS_JSON
    expect(
      isAllowedRedirectHost('tailscale-dev-siyang.taila2a609.ts.net:4200')
    ).toBe(true)
  })

  it('rejects a dev host when NEXT_PUBLIC_DEV_HOSTS is unset (no dev relaxation)', () => {
    expect(
      isAllowedRedirectHost('tailscale-dev-siyang.taila2a609.ts.net:4200')
    ).toBe(false)
  })

  it('rejects a dev host when NEXT_PUBLIC_DEV_HOSTS is empty', () => {
    process.env.NEXT_PUBLIC_DEV_HOSTS = ''
    expect(
      isAllowedRedirectHost('tailscale-dev-siyang.taila2a609.ts.net:4200')
    ).toBe(false)
  })

  it('rejects a dev host when NEXT_PUBLIC_DEV_HOSTS is malformed JSON', () => {
    process.env.NEXT_PUBLIC_DEV_HOSTS = '{not valid json'
    expect(
      isAllowedRedirectHost('tailscale-dev-siyang.taila2a609.ts.net:4200')
    ).toBe(false)
  })

  it('rejects unknown hosts even when NEXT_PUBLIC_DEV_HOSTS is set', () => {
    process.env.NEXT_PUBLIC_DEV_HOSTS = DEV_HOSTS_JSON
    expect(isAllowedRedirectHost('attacker.example.com')).toBe(false)
  })

  it('rejects spoofed hosts not present in NEXT_PUBLIC_DEV_HOSTS', () => {
    process.env.NEXT_PUBLIC_DEV_HOSTS = DEV_HOSTS_JSON
    expect(isAllowedRedirectHost('tailscale-evil.attacker.com')).toBe(false)
    expect(isAllowedRedirectHost('tailscale-evil.attacker.com:4200')).toBe(
      false
    )
  })
})

describe('redirectToApp', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.NEXT_PUBLIC_DEV_HOSTS
  })

  afterEach(() => {
    process.env = originalEnv
  })

  function buildCtx(redirect: string | undefined): GetServerSidePropsContext {
    return {
      query: redirect != null ? { redirect } : {}
    } as unknown as GetServerSidePropsContext
  }

  it('redirects to relative paths verbatim', () => {
    const result = redirectToApp(buildCtx('/journeys/abc'))
    expect(result.redirect.destination).toBe('/journeys/abc')
  })

  it('rejects protocol-relative paths', () => {
    const result = redirectToApp(buildCtx('//evil.example.com/'))
    expect(result.redirect.destination).toBe('/')
  })

  it('allows absolute URL to admin.nextstep.is', () => {
    const result = redirectToApp(buildCtx('https://admin.nextstep.is/dash'))
    expect(result.redirect.destination).toBe('https://admin.nextstep.is/dash')
  })

  it('allows absolute URL to a host listed in NEXT_PUBLIC_DEV_HOSTS', () => {
    process.env.NEXT_PUBLIC_DEV_HOSTS = JSON.stringify({
      siyang: 'tailscale-dev-siyang.taila2a609.ts.net'
    })
    const result = redirectToApp(
      buildCtx(
        'http://tailscale-dev-siyang.taila2a609.ts.net:4200/journeys/abc'
      )
    )
    expect(result.redirect.destination).toBe(
      'http://tailscale-dev-siyang.taila2a609.ts.net:4200/journeys/abc'
    )
  })

  it('rejects absolute URL to a dev host when NEXT_PUBLIC_DEV_HOSTS is unset', () => {
    const result = redirectToApp(
      buildCtx(
        'http://tailscale-dev-siyang.taila2a609.ts.net:4200/journeys/abc'
      )
    )
    expect(result.redirect.destination).toBe('/')
  })

  it('defaults to / when redirect param is absent', () => {
    const result = redirectToApp(buildCtx(undefined))
    expect(result.redirect.destination).toBe('/')
  })

  it('defaults to / when redirect param is malformed', () => {
    const result = redirectToApp(buildCtx('not a url'))
    expect(result.redirect.destination).toBe('/')
  })
})
