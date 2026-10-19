import {
  isPublicHostname,
  isPublicHttpsUrl,
  isPublicWebUrl
} from './destination'

describe('isPublicHttpsUrl', () => {
  it.each([
    'https://www.jesusfilm.org/watch',
    'https://example.com:8443/path?x=1',
    'https://[2606:4700:4700::1111]/'
  ])('accepts %s', (value) => {
    expect(isPublicHttpsUrl(value)).toBe(true)
  })

  it.each([
    'http://www.jesusfilm.org/', // not https
    'https://localhost/',
    'https://api.internal/',
    'https://db.local/',
    'https://intranet/', // no dot: resolves inside the VPC
    'https://127.0.0.1/',
    'https://10.1.2.3/',
    'https://172.20.0.1/',
    'https://192.168.1.1/',
    'https://169.254.169.254/latest/meta-data/', // cloud metadata
    'https://100.64.0.1/',
    'https://[::1]/',
    'https://[fd00::1]/',
    'https://[fe80::1]/',
    'https://[::ffff:10.0.0.1]/',
    'not a url'
  ])('rejects %s', (value) => {
    expect(isPublicHttpsUrl(value)).toBe(false)
  })
})

describe('SHORT_LINKS_ALLOW_LOCAL_DESTINATIONS', () => {
  afterEach(() => {
    delete process.env.SHORT_LINKS_ALLOW_LOCAL_DESTINATIONS
  })

  it('lets a local-dev process point links at localhost, and nothing else changes', () => {
    process.env.SHORT_LINKS_ALLOW_LOCAL_DESTINATIONS = 'true'
    expect(isPublicWebUrl('http://localhost:4100/journey')).toBe(true)
    expect(isPublicWebUrl('https://10.1.2.3/')).toBe(true)
    expect(isPublicWebUrl('not a url')).toBe(false)
    expect(isPublicHttpsUrl('http://localhost:4100/')).toBe(false) // still https only
  })

  it('is off unless set to exactly "true"', () => {
    process.env.SHORT_LINKS_ALLOW_LOCAL_DESTINATIONS = 'false'
    expect(isPublicWebUrl('http://localhost:4100/journey')).toBe(false)
  })
})

describe('isPublicHostname', () => {
  it('treats public addresses and names as public', () => {
    expect(isPublicHostname('8.8.8.8')).toBe(true)
    expect(isPublicHostname('jesus.film')).toBe(true)
  })

  it('treats private addresses as not public', () => {
    expect(isPublicHostname('10.0.0.1')).toBe(false)
    expect(isPublicHostname('LOCALHOST')).toBe(false)
  })
})

describe('isPublicWebUrl', () => {
  it('accepts http as well as https, but still only public hosts', () => {
    expect(isPublicWebUrl('http://www.jesusfilm.org/')).toBe(true)
    expect(isPublicWebUrl('http://10.0.0.1/')).toBe(false)
    expect(isPublicWebUrl('ftp://example.com/')).toBe(false)
  })
})
