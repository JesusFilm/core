import { GetServerSidePropsContext } from 'next'

import { isAllowedRedirectHost, redirectToApp } from './getAuthTokens'

describe('isAllowedRedirectHost', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('allows known hosts in any environment', () => {
    ;(process.env as Record<string, string>).NODE_ENV = 'production'
    expect(isAllowedRedirectHost('localhost:4200')).toBe(true)
    expect(isAllowedRedirectHost('admin.nextstep.is')).toBe(true)
    expect(isAllowedRedirectHost('admin-stage.nextstep.is')).toBe(true)
  })

  it('allows tailscale-* host in dev', () => {
    ;(process.env as Record<string, string>).NODE_ENV = 'development'
    expect(isAllowedRedirectHost('tailscale-mbp-siyang:4200')).toBe(true)
  })

  it('allows uppercase TAILSCALE-* host in dev (case-insensitive)', () => {
    ;(process.env as Record<string, string>).NODE_ENV = 'development'
    expect(isAllowedRedirectHost('TAILSCALE-MBP:4200')).toBe(true)
  })

  it('rejects tailscale-* host in production', () => {
    ;(process.env as Record<string, string>).NODE_ENV = 'production'
    expect(isAllowedRedirectHost('tailscale-mbp-siyang:4200')).toBe(false)
  })

  it('rejects unknown hosts in dev', () => {
    ;(process.env as Record<string, string>).NODE_ENV = 'development'
    expect(isAllowedRedirectHost('attacker.example.com')).toBe(false)
  })
})

describe('redirectToApp', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
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

  it('allows absolute URL to tailscale-* host in dev', () => {
    ;(process.env as Record<string, string>).NODE_ENV = 'development'
    const result = redirectToApp(
      buildCtx('http://tailscale-mbp-siyang:4200/journeys/abc')
    )
    expect(result.redirect.destination).toBe(
      'http://tailscale-mbp-siyang:4200/journeys/abc'
    )
  })

  it('rejects absolute URL to tailscale-* host in production', () => {
    ;(process.env as Record<string, string>).NODE_ENV = 'production'
    const result = redirectToApp(
      buildCtx('http://tailscale-mbp-siyang:4200/journeys/abc')
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
