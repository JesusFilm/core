import { getDevHosts, isDevHost } from './devHosts'

describe('getDevHosts', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.NEXT_PUBLIC_DEV_HOSTS
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('returns [] when NEXT_PUBLIC_DEV_HOSTS is unset', () => {
    expect(getDevHosts()).toEqual([])
  })

  it('returns [] when NEXT_PUBLIC_DEV_HOSTS is an empty string', () => {
    process.env.NEXT_PUBLIC_DEV_HOSTS = ''
    expect(getDevHosts()).toEqual([])
  })

  it('returns [] when NEXT_PUBLIC_DEV_HOSTS is malformed JSON', () => {
    process.env.NEXT_PUBLIC_DEV_HOSTS = '{not valid json'
    expect(getDevHosts()).toEqual([])
  })

  it('returns [] when NEXT_PUBLIC_DEV_HOSTS parses to null', () => {
    process.env.NEXT_PUBLIC_DEV_HOSTS = 'null'
    expect(getDevHosts()).toEqual([])
  })

  it('returns [] when NEXT_PUBLIC_DEV_HOSTS parses to a string (Object.values footgun)', () => {
    process.env.NEXT_PUBLIC_DEV_HOSTS = '"a string"'
    expect(getDevHosts()).toEqual([])
  })

  it('returns [] when NEXT_PUBLIC_DEV_HOSTS parses to a number', () => {
    process.env.NEXT_PUBLIC_DEV_HOSTS = '42'
    expect(getDevHosts()).toEqual([])
  })

  it('returns the object values when NEXT_PUBLIC_DEV_HOSTS is a valid JSON object', () => {
    process.env.NEXT_PUBLIC_DEV_HOSTS = JSON.stringify({
      siyang: 'tailscale-dev-siyang.taila2a609.ts.net',
      mike: 'tailscale-dev-mike.taila2a609.ts.net'
    })
    expect(getDevHosts()).toEqual([
      'tailscale-dev-siyang.taila2a609.ts.net',
      'tailscale-dev-mike.taila2a609.ts.net'
    ])
  })

  it('filters out non-string values', () => {
    process.env.NEXT_PUBLIC_DEV_HOSTS = JSON.stringify({
      siyang: 'tailscale-dev-siyang.taila2a609.ts.net',
      bogus: 42,
      also: null
    })
    expect(getDevHosts()).toEqual(['tailscale-dev-siyang.taila2a609.ts.net'])
  })
})

describe('isDevHost', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.NEXT_PUBLIC_DEV_HOSTS
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('returns true for a host listed in NEXT_PUBLIC_DEV_HOSTS', () => {
    process.env.NEXT_PUBLIC_DEV_HOSTS = JSON.stringify({
      siyang: 'tailscale-dev-siyang.taila2a609.ts.net'
    })
    expect(isDevHost('tailscale-dev-siyang.taila2a609.ts.net')).toBe(true)
  })

  it('returns false for a host not in NEXT_PUBLIC_DEV_HOSTS', () => {
    process.env.NEXT_PUBLIC_DEV_HOSTS = JSON.stringify({
      siyang: 'tailscale-dev-siyang.taila2a609.ts.net'
    })
    expect(isDevHost('tailscale-evil.attacker.com')).toBe(false)
  })

  it('returns false when NEXT_PUBLIC_DEV_HOSTS is unset', () => {
    expect(isDevHost('tailscale-dev-siyang.taila2a609.ts.net')).toBe(false)
  })

  it('returns false when NEXT_PUBLIC_DEV_HOSTS is malformed', () => {
    process.env.NEXT_PUBLIC_DEV_HOSTS = '{not valid json'
    expect(isDevHost('tailscale-dev-siyang.taila2a609.ts.net')).toBe(false)
  })

  it('does exact (case-sensitive) matching', () => {
    process.env.NEXT_PUBLIC_DEV_HOSTS = JSON.stringify({
      siyang: 'tailscale-dev-siyang.taila2a609.ts.net'
    })
    expect(isDevHost('TAILSCALE-DEV-SIYANG.TAILA2A609.TS.NET')).toBe(false)
  })
})
