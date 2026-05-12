import { getDevHosts, isDevHost } from './devHosts'

const LOCAL_DEV_HOSTS = ['localhost', '127.0.0.1']

describe('getDevHosts', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.NEXT_PUBLIC_DEV_HOSTS
    delete process.env.DEV_HOSTS
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('returns the localhost baseline when NEXT_PUBLIC_DEV_HOSTS and DEV_HOSTS are unset', () => {
    expect(getDevHosts()).toEqual(LOCAL_DEV_HOSTS)
  })

  it('returns the localhost baseline when NEXT_PUBLIC_DEV_HOSTS is an empty string', () => {
    process.env.NEXT_PUBLIC_DEV_HOSTS = ''
    expect(getDevHosts()).toEqual(LOCAL_DEV_HOSTS)
  })

  it('returns the localhost baseline when NEXT_PUBLIC_DEV_HOSTS is malformed JSON', () => {
    process.env.NEXT_PUBLIC_DEV_HOSTS = '{not json'
    expect(getDevHosts()).toEqual(LOCAL_DEV_HOSTS)
  })

  it('returns the localhost baseline when NEXT_PUBLIC_DEV_HOSTS parses to null', () => {
    process.env.NEXT_PUBLIC_DEV_HOSTS = 'null'
    expect(getDevHosts()).toEqual(LOCAL_DEV_HOSTS)
  })

  it('returns the localhost baseline when NEXT_PUBLIC_DEV_HOSTS parses to a string (Object.values footgun)', () => {
    process.env.NEXT_PUBLIC_DEV_HOSTS = '"a string"'
    expect(getDevHosts()).toEqual(LOCAL_DEV_HOSTS)
  })

  it('returns the localhost baseline when NEXT_PUBLIC_DEV_HOSTS parses to a number', () => {
    process.env.NEXT_PUBLIC_DEV_HOSTS = '42'
    expect(getDevHosts()).toEqual(LOCAL_DEV_HOSTS)
  })

  it('merges localhost baseline with array elements when NEXT_PUBLIC_DEV_HOSTS is a JSON array of strings', () => {
    process.env.NEXT_PUBLIC_DEV_HOSTS = '["a", "b"]'
    expect(getDevHosts()).toEqual([...LOCAL_DEV_HOSTS, 'a', 'b'])
  })

  it('merges localhost baseline with the object values when NEXT_PUBLIC_DEV_HOSTS is a valid JSON object', () => {
    process.env.NEXT_PUBLIC_DEV_HOSTS = JSON.stringify({
      siyang: 'host1',
      mike: 'host2'
    })
    expect(getDevHosts()).toEqual([...LOCAL_DEV_HOSTS, 'host1', 'host2'])
  })

  it('filters out non-string values', () => {
    process.env.NEXT_PUBLIC_DEV_HOSTS = JSON.stringify({
      a: 'host',
      b: 42,
      c: null
    })
    expect(getDevHosts()).toEqual([...LOCAL_DEV_HOSTS, 'host'])
  })

  it('falls back to DEV_HOSTS when NEXT_PUBLIC_DEV_HOSTS is unset', () => {
    process.env.DEV_HOSTS = JSON.stringify({ s: 'host' })
    expect(getDevHosts()).toEqual([...LOCAL_DEV_HOSTS, 'host'])
  })

  it('prefers NEXT_PUBLIC_DEV_HOSTS over DEV_HOSTS when both are set', () => {
    process.env.NEXT_PUBLIC_DEV_HOSTS = JSON.stringify({ a: 'public-host' })
    process.env.DEV_HOSTS = JSON.stringify({ a: 'server-host' })
    expect(getDevHosts()).toEqual([...LOCAL_DEV_HOSTS, 'public-host'])
  })
})

describe('isDevHost', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.NEXT_PUBLIC_DEV_HOSTS
    delete process.env.DEV_HOSTS
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

  it('does exact (case-sensitive) matching', () => {
    process.env.NEXT_PUBLIC_DEV_HOSTS = JSON.stringify({
      siyang: 'tailscale-dev-siyang.taila2a609.ts.net'
    })
    expect(isDevHost('TAILSCALE-DEV-SIYANG.TAILA2A609.TS.NET')).toBe(false)
  })

  it('returns true for localhost regardless of env state', () => {
    expect(isDevHost('localhost')).toBe(true)
    process.env.NEXT_PUBLIC_DEV_HOSTS = JSON.stringify({ s: 'other-host' })
    expect(isDevHost('localhost')).toBe(true)
  })

  it('returns true for 127.0.0.1 regardless of env state', () => {
    expect(isDevHost('127.0.0.1')).toBe(true)
    process.env.NEXT_PUBLIC_DEV_HOSTS = JSON.stringify({ s: 'other-host' })
    expect(isDevHost('127.0.0.1')).toBe(true)
  })

  it('does not allow prefix-based bypass of localhost', () => {
    expect(isDevHost('localhost.evil.com')).toBe(false)
    expect(isDevHost('127.0.0.1.evil.com')).toBe(false)
  })
})
