import { fetchMock } from '../test/fetchMock'
import { domainRecord, routingRecord } from '../test/fixtures'
import {
  graphQlEndpoint,
  seedRecords,
  workerRequest
} from '../test/workerRequest'

import { LOST_PAGE_TITLE } from './lostPage'
import { isDomainRecord } from './records'
import { type LinkLookup, pathUnderPrefix, resolve } from './resolve'
import { clearDomainCache } from './store'

const missing: LinkLookup = async () => null

const legacyDomain: Record<string, unknown> = {
  ...domainRecord({ hostname: 'legacy.example' })
}
delete legacyDomain.pathPrefix

function graphQlMiss(): void {
  fetchMock
    .get(graphQlEndpoint)
    .intercept({ path: '/', method: 'POST' })
    .reply(() => ({
      statusCode: 200,
      data: JSON.stringify({
        data: { shortLinkByPath: { __typename: 'NotFoundError' } }
      })
    }))
}

describe('pathUnderPrefix', () => {
  it.each([
    ['', '/abc', 'abc'],
    ['', '/', ''],
    ['', '/s/abc', 's/abc'],
    ['s', '/s/abc', 'abc'],
    ['s', '/s/a/b', 'a/b'],
    ['s', '/s', null],
    ['s', '/s/', null],
    ['s', '/abc', null],
    ['s', '/sx/abc', null],
    ['s', '/S/abc', null],
    ['s', '/', null],
    ['a/b', '/a/b/abc', 'abc'],
    ['a/b', '/a/abc', null],
    ['a/b', '/a/b', null],
    ['a/b', '/a/b/', null]
  ])('prefix "%s", path %s -> %s', (pathPrefix, pathname, expected) => {
    expect(pathUnderPrefix({ pathPrefix }, pathname)).toBe(expected)
  })
})

describe('resolve with a path prefix', () => {
  it('looks up the bare slug and keeps the prefix out of the key', async () => {
    const lookup = vi.fn<LinkLookup>(async () => ({
      record: routingRecord(),
      resolvedFrom: 'kv'
    }))

    const resolution = await resolve({
      domain: domainRecord({ hostname: 'jesus.film', pathPrefix: 's' }),
      pathname: '/s/abc',
      search: '',
      lookup
    })

    expect(lookup).toHaveBeenCalledWith(
      'link:jesus.film/abc',
      'jesus.film',
      'abc'
    )
    expect(resolution).toMatchObject({ kind: 'redirect', pathname: 'abc' })
  })

  it('never looks up a path outside the prefix', async () => {
    const lookup = vi.fn(missing)
    const domain = domainRecord({ hostname: 'jesus.film', pathPrefix: 's' })

    for (const pathname of ['/abc', '/s', '/s/', '/']) {
      await resolve({ domain, pathname, search: '', lookup })
    }

    expect(lookup).not.toHaveBeenCalled()
  })

  it('forwards the original, unstripped path on passthrough', async () => {
    const domain = domainRecord({
      hostname: 'pass.example',
      pathPrefix: 's',
      notFound: 'passthrough',
      passthroughOrigin: 'https://origin.example'
    })

    expect(
      await resolve({
        domain,
        pathname: '/abc',
        search: '?x=1',
        lookup: missing
      })
    ).toEqual({
      kind: 'passthrough',
      location: 'https://origin.example/abc?x=1'
    })
    expect(
      await resolve({
        domain,
        pathname: '/s/unknown',
        search: '?x=1',
        lookup: missing
      })
    ).toEqual({
      kind: 'passthrough',
      location: 'https://origin.example/s/unknown?x=1'
    })
  })
})

describe('isDomainRecord pathPrefix', () => {
  it('normalises a missing pathPrefix to the empty string', () => {
    const record = { ...legacyDomain }

    expect(isDomainRecord(record)).toBe(true)
    expect(record.pathPrefix).toBe('')
  })

  it('accepts a string and trims stray slashes', () => {
    const record: Record<string, unknown> = {
      ...domainRecord({ hostname: 'x.example' }),
      pathPrefix: '/a/b/'
    }

    expect(isDomainRecord(record)).toBe(true)
    expect(record.pathPrefix).toBe('a/b')
  })

  it.each([[null], [1], [true], [['s']]])('rejects %j', (pathPrefix) => {
    expect(
      isDomainRecord({ ...domainRecord({ hostname: 'x.example' }), pathPrefix })
    ).toBe(false)
  })
})

describe('worker with a path prefix', () => {
  beforeAll(async () => {
    fetchMock.activate()
    await seedRecords({
      'domain:jesus.film': domainRecord({
        hostname: 'jesus.film',
        pathPrefix: 's',
        slugCaseSensitive: false,
        notFound: 'fallback',
        fallbackTo: 'https://www.jesusfilm.org',
        reservedPaths: [
          'dashboard',
          'api',
          'admin',
          '_next',
          '.well-known',
          'favicon.ico',
          'robots.txt'
        ]
      }),
      'domain:lost.example': domainRecord({
        hostname: 'lost.example',
        pathPrefix: 's'
      }),
      'domain:pass.example': domainRecord({
        hostname: 'pass.example',
        pathPrefix: 's',
        notFound: 'passthrough',
        passthroughOrigin: 'https://origin.example',
        reservedPaths: ['dashboard']
      }),
      'domain:multi.example': domainRecord({
        hostname: 'multi.example',
        pathPrefix: 'go/to'
      }),
      'domain:legacy.example': legacyDomain,
      'link:jesus.film/abc': routingRecord({
        id: 'link-jf',
        to: 'https://example.com/jf'
      }),
      'link:multi.example/abc': routingRecord({
        id: 'link-multi',
        to: 'https://example.com/multi'
      }),
      'link:legacy.example/abc': routingRecord({
        id: 'link-legacy',
        to: 'https://example.com/legacy'
      })
    })
  })

  afterAll(() => fetchMock.deactivate())

  beforeEach(() => clearDomainCache())

  afterEach(() => fetchMock.assertNoPendingInterceptors())

  it('resolves /s/abc on a prefix domain', async () => {
    const { response, sent } = await workerRequest(
      'https://jesus.film/s/abc?utm_source=yt&qr=1'
    )

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(
      'https://example.com/jf?utm_source=yt'
    )
    expect(sent).toHaveLength(1)
    expect(sent[0]).toMatchObject({
      hostname: 'jesus.film',
      pathname: 'abc',
      linkId: 'link-jf',
      attribution: 'qr'
    })
  })

  it('lower-cases the slug under a prefix on a case-insensitive domain', async () => {
    const { response, sent } = await workerRequest('https://jesus.film/s/ABC')

    expect(response.status).toBe(307)
    expect(sent[0]?.pathname).toBe('abc')
  })

  it('does not lower-case the prefix itself', async () => {
    const { response } = await workerRequest('https://jesus.film/S/abc')

    expect(response.headers.get('location')).toBe('https://www.jesusfilm.org')
  })

  it('sends the bare slug to api-media', async () => {
    let variables: unknown
    fetchMock
      .get(graphQlEndpoint)
      .intercept({ path: '/', method: 'POST' })
      .reply(({ body }) => {
        variables = (JSON.parse(body ?? '{}') as { variables: unknown })
          .variables
        return {
          statusCode: 200,
          data: JSON.stringify({
            data: { shortLinkByPath: { __typename: 'NotFoundError' } }
          })
        }
      })

    await workerRequest('https://jesus.film/s/unpublished')

    expect(variables).toEqual({
      hostname: 'jesus.film',
      pathname: 'unpublished'
    })
  })

  it('resolves under a multi-segment prefix', async () => {
    const { response } = await workerRequest('https://multi.example/go/to/abc')

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('https://example.com/multi')
  })

  it.each(['/go/abc', '/go/to', '/go/to/', '/abc'])(
    'serves the lost page for %s on a multi-segment prefix domain',
    async (path) => {
      const { response } = await workerRequest(`https://multi.example${path}`)

      expect(response.status).toBe(404)
    }
  )

  it('treats a record without pathPrefix as a root domain', async () => {
    const { response } = await workerRequest('https://legacy.example/abc')

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('https://example.com/legacy')
  })

  describe.each(['/abc', '/s', '/s/'])('%s on a prefix domain', (path) => {
    it('serves the lost page on a lostPage domain', async () => {
      const { response, sent } = await workerRequest(
        `https://lost.example${path}`
      )

      expect(response.status).toBe(404)
      expect(await response.text()).toContain(LOST_PAGE_TITLE)
      expect(sent).toHaveLength(0)
    })

    it('redirects to the domain fallback on a fallback domain', async () => {
      const { response, sent } = await workerRequest(
        `https://jesus.film${path}`
      )

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe('https://www.jesusfilm.org')
      expect(sent).toHaveLength(0)
    })

    it('passes the original path through on a passthrough domain', async () => {
      const { response } = await workerRequest(
        `https://pass.example${path}?x=1`
      )

      expect(response.status).toBe(302)
      expect(response.headers.get('location')).toBe(
        `https://origin.example${path}?x=1`
      )
    })
  })

  describe('reserved path under the prefix', () => {
    it('gets the fallback behaviour', async () => {
      const { response } = await workerRequest('https://jesus.film/s/dashboard')

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe('https://www.jesusfilm.org')
    })

    it('gets the passthrough behaviour', async () => {
      const { response } = await workerRequest(
        'https://pass.example/s/dashboard'
      )

      expect(response.status).toBe(302)
      expect(response.headers.get('location')).toBe(
        'https://origin.example/s/dashboard'
      )
    })

    it('gets the lost page for an unknown slug after the stores miss', async () => {
      graphQlMiss()
      const { response } = await workerRequest('https://lost.example/s/nope')

      expect(response.status).toBe(404)
    })
  })
})
