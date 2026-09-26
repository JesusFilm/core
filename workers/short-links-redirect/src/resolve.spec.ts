import { domainRecord, routingRecord } from '../test/fixtures'

import { type LinkLookup, isCandidateSlug, resolve } from './resolve'

const missing: LinkLookup = async () => null

function hit(record = routingRecord()): LinkLookup {
  return async () => ({ record, resolvedFrom: 'kv' })
}

describe('isCandidateSlug', () => {
  const domain = domainRecord({
    hostname: 'arc.gt',
    reservedPaths: ['s', 'api']
  })

  it.each([
    ['', false],
    ['abc', true],
    ['a/b', false],
    ['s', false],
    ['api', false],
    ['S', true],
    ['with space', false],
    ['ok_.~-', true],
    ['x'.repeat(64), true],
    ['x'.repeat(65), false],
    ['%20', false]
  ])('%s -> %s', (path, expected) => {
    expect(isCandidateSlug(domain, path)).toBe(expected)
  })
})

describe('resolve', () => {
  it('redirects a hit with the record status and forwards the query', async () => {
    const lookup = vi.fn(hit(routingRecord({ status: 301 })))
    const resolution = await resolve({
      domain: domainRecord({ hostname: 'nxstp.is' }),
      pathname: '/abc',
      search: '?utm_source=yt&qr=1',
      lookup
    })

    expect(lookup).toHaveBeenCalledWith('link:nxstp.is/abc', 'nxstp.is', 'abc')
    expect(resolution).toMatchObject({
      kind: 'redirect',
      status: 301,
      source: 'link',
      pathname: 'abc',
      resolvedFrom: 'kv',
      location: 'https://www.jesusfilm.org/watch/jesus.html?utm_source=yt'
    })
  })

  it('lower-cases the lookup key on a case-insensitive domain', async () => {
    const lookup = vi.fn(missing)
    await resolve({
      domain: domainRecord({
        hostname: 'yt.example',
        slugCaseSensitive: false
      }),
      pathname: '/AbC',
      search: '',
      lookup
    })

    expect(lookup).toHaveBeenCalledWith(
      'link:yt.example/abc',
      'yt.example',
      'abc'
    )
  })

  it('never looks up a reserved or malformed path', async () => {
    const lookup = vi.fn(missing)
    const domain = domainRecord({ hostname: 'arc.gt', reservedPaths: ['s'] })

    await resolve({ domain, pathname: '/s/1_jf-0-0/529', search: '', lookup })
    await resolve({ domain, pathname: '/', search: '', lookup })
    await resolve({ domain, pathname: '/bad slug', search: '', lookup })

    expect(lookup).not.toHaveBeenCalled()
  })

  it('falls through to the domain behaviour for a paused link without fallbacks', async () => {
    const resolution = await resolve({
      domain: domainRecord({ hostname: 'nxstp.is' }),
      pathname: '/abc',
      search: '',
      lookup: hit(routingRecord({ paused: true }))
    })

    expect(resolution).toEqual({ kind: 'lostPage' })
  })

  it('prefers the link fallback over the domain fallback when paused', async () => {
    const resolution = await resolve({
      domain: domainRecord({
        hostname: 'nxstp.is',
        fallbackTo: 'https://domain.example/'
      }),
      pathname: '/abc',
      search: '',
      lookup: hit(
        routingRecord({ paused: true, fallbackTo: 'https://link.example/' })
      )
    })

    expect(resolution).toMatchObject({
      kind: 'redirect',
      location: 'https://link.example/',
      source: 'linkFallback'
    })
  })

  it('uses the domain fallback when a paused link has none', async () => {
    const resolution = await resolve({
      domain: domainRecord({
        hostname: 'nxstp.is',
        redirectStatus: 302,
        fallbackTo: 'https://domain.example/'
      }),
      pathname: '/abc',
      search: '',
      lookup: hit(routingRecord({ paused: true }))
    })

    expect(resolution).toEqual({
      kind: 'redirect',
      location: 'https://domain.example/',
      status: 302,
      source: 'domainFallback'
    })
  })

  it('serves the lost page when a record has an unparseable destination', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const resolution = await resolve({
      domain: domainRecord({ hostname: 'nxstp.is' }),
      pathname: '/abc',
      search: '',
      lookup: hit(routingRecord({ to: 'not a url' }))
    })

    expect(resolution).toEqual({ kind: 'lostPage' })
    error.mockRestore()
  })

  it('builds the passthrough location from the raw path and query', async () => {
    const resolution = await resolve({
      domain: domainRecord({
        hostname: 'arc.gt',
        notFound: 'passthrough',
        passthroughOrigin: 'https://api.arclight.org/',
        reservedPaths: ['s']
      }),
      pathname: '/s/1_jf-0-0/529',
      search: '?x=1',
      lookup: missing
    })

    expect(resolution).toEqual({
      kind: 'passthrough',
      location: 'https://api.arclight.org/s/1_jf-0-0/529?x=1'
    })
  })

  it('redirects to the domain fallback with the domain status for an unknown slug', async () => {
    const resolution = await resolve({
      domain: domainRecord({
        hostname: 'fb.example',
        notFound: 'fallback',
        redirectStatus: 308,
        fallbackTo: 'https://www.jesusfilm.org/'
      }),
      pathname: '/nope',
      search: '',
      lookup: missing
    })

    expect(resolution).toEqual({
      kind: 'redirect',
      location: 'https://www.jesusfilm.org/',
      status: 308,
      source: 'domainFallback'
    })
  })
})
