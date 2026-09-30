import {
  createExecutionContext,
  env,
  waitOnExecutionContext
} from 'cloudflare:test'

import { fetchMock } from '../test/fetchMock'
import { domainRecord, routingRecord } from '../test/fixtures'

import type { Env } from './env'
import type { RedirectEvent } from './event'
import { LOST_PAGE_TITLE } from './lostPage'
import type { DomainRecord, RoutingRecord } from './records'
import { clearDomainCache } from './store'

import worker from '.'

const graphQlEndpoint = 'http://graphql.example.com'

const bindings = env as unknown as Env

const domains: Record<string, DomainRecord> = {
  'nxstp.is': domainRecord({
    hostname: 'nxstp.is',
    redirectStatus: 307,
    kvBinding: 'KV_NXSTP_IS'
  }),
  'arc.gt': domainRecord({
    hostname: 'arc.gt',
    redirectStatus: 302,
    kvBinding: 'KV_ARC_GT',
    notFound: 'passthrough',
    passthroughOrigin: 'https://api.arclight.org',
    reservedPaths: ['s', 'hls', 'dl', 'dh', 'v2', 'api']
  }),
  'fallback.example': domainRecord({
    hostname: 'fallback.example',
    redirectStatus: 301,
    kvBinding: 'KV_STG_ARC_GT',
    notFound: 'fallback',
    fallbackTo: 'https://www.jesusfilm.org/'
  }),
  'nofallback.example': domainRecord({
    hostname: 'nofallback.example',
    notFound: 'fallback',
    fallbackTo: null
  }),
  'noorigin.example': domainRecord({
    hostname: 'noorigin.example',
    notFound: 'passthrough',
    passthroughOrigin: null
  }),
  'lower.example': domainRecord({
    hostname: 'lower.example',
    slugCaseSensitive: false,
    kvBinding: 'KV_JESUS_FILM',
    reservedPaths: ['Admin']
  })
}

/** Routing records per domain, keyed by bare slug (they live in the domain's namespace). */
const links: Record<string, Record<string, RoutingRecord>> = {
  'nxstp.is': {
    jesus: routingRecord({ id: 'link-jesus', hostname: 'nxstp.is' }),
    perma: routingRecord({ id: 'link-perma', status: 301 }),
    withquery: routingRecord({
      id: 'link-withquery',
      to: 'https://example.com/landing?keep=1#section'
    }),
    'paused-link-fallback': routingRecord({
      id: 'link-paused-1',
      paused: true,
      fallbackTo: 'https://example.com/link-fallback'
    }),
    'paused-no-fallback': routingRecord({
      id: 'link-paused-2',
      paused: true
    })
  },
  'fallback.example': {
    paused: routingRecord({ id: 'link-paused-3', paused: true })
  },
  'arc.gt': {
    abc123: routingRecord({
      id: 'link-arc',
      to: 'https://api.arclight.org/abc123',
      status: 302,
      campaignIds: ['camp-1'],
      videoId: '1_jf-0-0',
      youtubeVideoId: 'dQw4w9WgXcQ',
      placement: 'inVideoQr',
      language: 'en',
      hostname: 'arc.gt'
    })
  },
  'lower.example': {
    mixedcase: routingRecord({ id: 'link-lower' })
  }
}

function namespaceOf(hostname: string): KVNamespace {
  const binding = domains[hostname]?.kvBinding
  if (binding == null) throw new Error(`no kvBinding for ${hostname}`)
  return bindings[binding] as KVNamespace
}

async function seedKv(): Promise<void> {
  for (const [hostname, record] of Object.entries(domains)) {
    await bindings.SHORT_LINKS_KV.put(
      `domain:${hostname}`,
      JSON.stringify(record)
    )
  }
  for (const [hostname, records] of Object.entries(links)) {
    for (const [slug, record] of Object.entries(records)) {
      await namespaceOf(hostname).put(slug, JSON.stringify(record))
    }
  }
}

async function seedD1(key: string, value: unknown): Promise<void> {
  await bindings.SHORT_LINKS_DB.prepare(
    'INSERT OR REPLACE INTO short_link_records (key, value, updated_at) VALUES (?, ?, ?)'
  )
    .bind(key, JSON.stringify(value), new Date().toISOString())
    .run()
}

interface RequestResult {
  response: Response
  sent: RedirectEvent[]
}

async function request(
  url: string,
  init: RequestInit & { cf?: Record<string, unknown> } = {},
  envOverrides: Partial<Env> = {}
): Promise<RequestResult> {
  const sent: RedirectEvent[] = []
  const send = vi.fn(async (message: RedirectEvent) => {
    sent.push(message)
  })
  const testEnv: Env = {
    ...bindings,
    CORE_GRAPHQL_ENDPOINT: graphQlEndpoint,
    SHORT_LINKS_EVENTS: {
      send,
      sendBatch: vi.fn()
    },
    ...envOverrides
  }
  const ctx = createExecutionContext()
  const response = await worker.fetch(new Request(url, init), testEnv, ctx)
  await waitOnExecutionContext(ctx)
  return { response, sent }
}

function graphQlReply(shortLink: unknown): void {
  fetchMock
    .get(graphQlEndpoint)
    .intercept({ path: '/', method: 'POST' })
    .reply(() => ({
      statusCode: 200,
      data: JSON.stringify({
        data: {
          shortLinkByPath:
            shortLink == null
              ? { __typename: 'NotFoundError', message: 'short link not found' }
              : { __typename: 'QueryShortLinkByPathSuccess', data: shortLink }
        }
      }),
      responseOptions: { headers: { 'Content-Type': 'application/json' } }
    }))
}

describe('short-links-redirect worker', () => {
  beforeAll(async () => {
    fetchMock.activate()
    await seedKv()
  })

  afterAll(() => fetchMock.deactivate())

  beforeEach(() => clearDomainCache())

  afterEach(() => fetchMock.assertNoPendingInterceptors())

  describe('redirects', () => {
    it('redirects a KV hit with the domain status', async () => {
      const { response, sent } = await request('https://nxstp.is/jesus')

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe(
        'https://www.jesusfilm.org/watch/jesus.html'
      )
      expect(response.headers.get('cache-control')).toBe('no-store')
      expect(sent).toHaveLength(1)
      expect(sent[0]).toMatchObject({
        v: 1,
        hostname: 'nxstp.is',
        pathname: 'jesus',
        linkId: 'link-jesus',
        status: 307,
        attribution: 'unknown',
        resolvedFrom: 'kv',
        global: false,
        ownerHostname: 'nxstp.is'
      })
    })

    it('uses the per-link status override', async () => {
      const { response } = await request('https://nxstp.is/perma')

      expect(response.status).toBe(301)
      expect(response.headers.get('location')).toBe(
        'https://www.jesusfilm.org/watch/jesus.html'
      )
    })

    it('matches the domain case-insensitively and ignores the port', async () => {
      const { response } = await request('https://NXSTP.IS:8443/jesus')

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe(
        'https://www.jesusfilm.org/watch/jesus.html'
      )
    })

    it('lower-cases the slug on a case-insensitive domain', async () => {
      const { response, sent } = await request(
        'https://lower.example/MixedCase'
      )

      expect(response.status).toBe(307)
      expect(sent[0]?.pathname).toBe('mixedcase')
    })

    it('keeps the slug case on a case-sensitive domain', async () => {
      graphQlReply(null)
      const { response } = await request('https://nxstp.is/JESUS')

      expect(response.status).toBe(404)
    })

    it('passes UTM parameters through and strips qr', async () => {
      const { response, sent } = await request(
        'https://nxstp.is/withquery?utm_source=yt&utm_medium=desc&qr=1&utm_campaign=easter'
      )

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe(
        'https://example.com/landing?keep=1&utm_source=yt&utm_medium=desc&utm_campaign=easter#section'
      )
      expect(sent[0]).toMatchObject({
        attribution: 'qr',
        utmSource: 'yt',
        utmMedium: 'desc',
        utmCampaign: 'easter',
        destination:
          'https://example.com/landing?keep=1&utm_source=yt&utm_medium=desc&utm_campaign=easter#section'
      })
    })

    it('answers HEAD with the redirect headers and no body', async () => {
      const { response, sent } = await request('https://nxstp.is/jesus', {
        method: 'HEAD'
      })

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe(
        'https://www.jesusfilm.org/watch/jesus.html'
      )
      expect(await response.text()).toBe('')
      expect(sent).toHaveLength(1)
    })

    it('fills the event from the request headers and cf', async () => {
      const { sent } = await request(
        'https://arc.gt/abc123?utm_source=qr-poster',
        {
          headers: {
            'user-agent':
              'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
            referer: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'accept-language': 'fr-CA,fr;q=0.9,en;q=0.8'
          },
          cf: { country: 'CA' }
        }
      )

      expect(sent).toHaveLength(1)
      expect(sent[0]).toMatchObject({
        hostname: 'arc.gt',
        pathname: 'abc123',
        linkId: 'link-arc',
        campaignIds: ['camp-1'],
        videoId: '1_jf-0-0',
        youtubeVideoId: 'dQw4w9WgXcQ',
        placement: 'inVideoQr',
        status: 302,
        attribution: 'direct',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        referrerHost: 'www.youtube.com',
        language: 'fr-CA',
        utmSource: 'qr-poster',
        utmMedium: null,
        utmCampaign: null,
        resolvedFrom: 'kv'
      })
      expect(sent[0]?.country).toBe('CA')
      expect(sent[0]?.ts).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    })

    it('still redirects when the queue send fails', async () => {
      const send = vi.fn(async () => {
        throw new Error('queue unavailable')
      })
      const { response } = await request(
        'https://nxstp.is/jesus',
        {},
        {
          SHORT_LINKS_EVENTS: { send } as unknown as Env['SHORT_LINKS_EVENTS']
        }
      )

      expect(response.status).toBe(307)
      expect(send).toHaveBeenCalledTimes(1)
    })
  })

  describe('paused links', () => {
    it('redirects a paused link to its own fallback', async () => {
      const { response, sent } = await request(
        'https://nxstp.is/paused-link-fallback'
      )

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe(
        'https://example.com/link-fallback'
      )
      expect(sent).toHaveLength(1)
      expect(sent[0]?.linkId).toBe('link-paused-1')
    })

    it('redirects a paused link without its own fallback to the domain fallback', async () => {
      const { response, sent } = await request(
        'https://fallback.example/paused'
      )

      expect(response.status).toBe(301)
      expect(response.headers.get('location')).toBe(
        'https://www.jesusfilm.org/'
      )
      expect(sent).toHaveLength(0)
    })

    it('serves the lost page for a paused link with no fallback anywhere', async () => {
      const { response, sent } = await request(
        'https://nxstp.is/paused-no-fallback'
      )

      expect(response.status).toBe(404)
      expect(await response.text()).toContain(LOST_PAGE_TITLE)
      expect(sent).toHaveLength(0)
    })
  })

  describe('not-found behaviour', () => {
    it('serves the lost page for an unknown host', async () => {
      const { response } = await request('https://unknown.example/jesus')

      expect(response.status).toBe(404)
      expect(response.headers.get('content-type')).toContain('text/html')
      expect(await response.text()).toContain(LOST_PAGE_TITLE)
    })

    it.each([
      ['https://nxstp.is/', 'empty path'],
      ['https://nxstp.is/a/b', 'nested path'],
      ['https://nxstp.is/has%20space', 'bad grammar'],
      ['https://nxstp.is/missing', 'unknown slug']
    ])('serves the lost page on a lostPage domain for %s (%s)', async (url) => {
      graphQlMissIfCandidate(url)
      const { response } = await request(url)

      expect(response.status).toBe(404)
      expect(await response.text()).toContain(LOST_PAGE_TITLE)
    })

    it('redirects to the domain fallback with the domain status on a fallback domain', async () => {
      const { response } = await request('https://fallback.example/x/y?z=1')

      expect(response.status).toBe(301)
      expect(response.headers.get('location')).toBe(
        'https://www.jesusfilm.org/'
      )
    })

    it('serves the lost page on a fallback domain without fallbackTo', async () => {
      const { response } = await request('https://nofallback.example/x/y')

      expect(response.status).toBe(404)
      expect(await response.text()).toContain(LOST_PAGE_TITLE)
    })

    it('passes a reserved arc.gt path through untouched', async () => {
      const { response } = await request('https://arc.gt/s/1_jf-0-0/529?x=1')

      expect(response.status).toBe(302)
      expect(response.headers.get('location')).toBe(
        'https://api.arclight.org/s/1_jf-0-0/529?x=1'
      )
    })

    it('passes an unknown arc.gt slug through after the store misses', async () => {
      graphQlReply(null)
      const { response } = await request('https://arc.gt/nope?y=2')

      expect(response.status).toBe(302)
      expect(response.headers.get('location')).toBe(
        'https://api.arclight.org/nope?y=2'
      )
    })

    it('serves the lost page on a passthrough domain without an origin', async () => {
      const { response } = await request('https://noorigin.example/s/abc')

      expect(response.status).toBe(404)
    })

    it('treats reserved paths case-insensitively on a case-insensitive domain', async () => {
      const { response } = await request('https://lower.example/admin')

      expect(response.status).toBe(404)
    })

    it.each([
      '/.well-known/apple-app-site-association',
      '/favicon.ico',
      '/robots.txt'
    ])('answers %s with a plain 404', async (path) => {
      const { response } = await request(`https://nxstp.is${path}`)

      expect(response.status).toBe(404)
      expect(response.headers.get('content-type')).toContain('text/plain')
    })
  })

  describe('store fallbacks', () => {
    it('falls back to D1 when KV misses', async () => {
      await seedD1(
        'link:nxstp.is/from-d1',
        routingRecord({ id: 'link-d1', to: 'https://example.com/d1' })
      )

      const { response, sent } = await request('https://nxstp.is/from-d1')

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe('https://example.com/d1')
      expect(sent[0]?.resolvedFrom).toBe('d1')
    })

    it('loads the domain from D1 when KV misses', async () => {
      await seedD1(
        'domain:d1only.example',
        domainRecord({
          hostname: 'd1only.example',
          redirectStatus: 308,
          notFound: 'fallback',
          fallbackTo: 'https://example.com/d1-domain'
        })
      )

      const { response } = await request('https://d1only.example/x/y')

      expect(response.status).toBe(308)
      expect(response.headers.get('location')).toBe(
        'https://example.com/d1-domain'
      )
    })

    it('treats a record with the wrong version as a miss for that store', async () => {
      await namespaceOf('nxstp.is').put(
        'versioned',
        JSON.stringify({ ...routingRecord({ id: 'stale' }), v: 2 })
      )
      await seedD1(
        'link:nxstp.is/versioned',
        routingRecord({ id: 'link-v1', to: 'https://example.com/v1' })
      )

      const { response, sent } = await request('https://nxstp.is/versioned')

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe('https://example.com/v1')
      expect(sent[0]?.resolvedFrom).toBe('d1')
    })

    it('falls back to api-media, writes the record back to the domain namespace and logs publish_gap', async () => {
      const log = vi.spyOn(console, 'log').mockImplementation(() => undefined)
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
              data: {
                shortLinkByPath: {
                  __typename: 'QueryShortLinkByPathSuccess',
                  data: {
                    id: 'link-api',
                    to: 'https://example.com/api',
                    status: 'active',
                    redirectStatus: null,
                    fallbackTo: null,
                    assetClass: 'videoEmbedded',
                    placement: 'endScreen',
                    videoId: null,
                    youtubeVideoId: 'yt-1',
                    language: 'en',
                    brightcoveId: null,
                    redirectType: null,
                    global: false,
                    campaigns: [{ id: 'camp-a' }, { id: 'camp-b' }],
                    domain: {
                      hostname: 'nxstp.is',
                      redirectStatus: 307,
                      fallbackTo: null,
                      passthroughOrigin: null
                    }
                  }
                }
              }
            }),
            responseOptions: { headers: { 'Content-Type': 'application/json' } }
          }
        })

      const { response, sent } = await request('https://nxstp.is/from-api')

      expect(variables).toEqual({ hostname: 'nxstp.is', pathname: 'from-api' })
      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe('https://example.com/api')
      expect(sent[0]).toMatchObject({
        linkId: 'link-api',
        campaignIds: ['camp-a', 'camp-b'],
        placement: 'endScreen',
        youtubeVideoId: 'yt-1',
        resolvedFrom: 'api'
      })

      const written = await namespaceOf('nxstp.is').get('from-api', 'json')
      expect(written).toMatchObject({
        v: 1,
        id: 'link-api',
        to: 'https://example.com/api',
        status: null,
        paused: false,
        assetClass: 'videoEmbedded',
        campaignIds: ['camp-a', 'camp-b'],
        global: false,
        hostname: 'nxstp.is'
      })
      expect(
        await bindings.SHORT_LINKS_KV.get('link:from-api', 'json')
      ).toBeNull()
      expect(log).toHaveBeenCalledWith(
        JSON.stringify({
          event: 'publish_gap',
          key: 'link:nxstp.is/from-api',
          target: 'KV_NXSTP_IS'
        })
      )
      log.mockRestore()
    })

    it('applies the Brightcove passthrough rule to an api-media hit', async () => {
      graphQlReply({
        id: 'link-bc',
        to: 'https://players.brightcove.net/whatever',
        status: 'active',
        redirectStatus: null,
        fallbackTo: null,
        assetClass: 'standard',
        placement: null,
        videoId: null,
        youtubeVideoId: null,
        language: null,
        brightcoveId: '1234',
        redirectType: 'hls',
        campaigns: [],
        domain: {
          redirectStatus: 302,
          fallbackTo: null,
          passthroughOrigin: 'https://api.arclight.org'
        }
      })

      const { response } = await request('https://arc.gt/bcslug')

      expect(response.status).toBe(302)
      expect(response.headers.get('location')).toBe(
        'https://api.arclight.org/bcslug'
      )
    })

    it('uses the not-found behaviour when api-media times out', async () => {
      const error = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined)
      fetchMock
        .get(graphQlEndpoint)
        .intercept({ path: '/', method: 'POST' })
        .replyWithError(new Error('The operation was aborted'))

      const { response, sent } = await request('https://nxstp.is/slow')

      expect(response.status).toBe(404)
      expect(await response.text()).toContain(LOST_PAGE_TITLE)
      expect(sent).toHaveLength(0)
      error.mockRestore()
    })

    it('treats a retired api-media link as a miss', async () => {
      graphQlReply({
        id: 'link-retired',
        to: 'https://example.com/retired',
        status: 'retired',
        redirectStatus: null,
        fallbackTo: null,
        assetClass: 'standard',
        placement: null,
        videoId: null,
        youtubeVideoId: null,
        language: null,
        brightcoveId: null,
        redirectType: null,
        campaigns: [],
        domain: {
          redirectStatus: 307,
          fallbackTo: null,
          passthroughOrigin: null
        }
      })

      const { response } = await request('https://nxstp.is/retired')

      expect(response.status).toBe(404)
    })

    it('skips api-media when no endpoint is configured', async () => {
      const { response } = await request(
        'https://nxstp.is/no-endpoint',
        {},
        {
          CORE_GRAPHQL_ENDPOINT: ''
        }
      )

      expect(response.status).toBe(404)
    })
  })

  describe('methods', () => {
    it.each(['POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'])(
      'answers %s with 405',
      async (method) => {
        const { response } = await request('https://nxstp.is/jesus', { method })

        expect(response.status).toBe(405)
        expect(response.headers.get('allow')).toBe('GET, HEAD')
      }
    )
  })
})

/**
 * A lostPage-domain URL whose path passes the slug grammar reaches api-media;
 * register a miss so the mock does not throw on the unmatched request.
 */
function graphQlMissIfCandidate(url: string): void {
  const path = new URL(url).pathname.slice(1)
  if (
    path === '' ||
    path.includes('/') ||
    !/^[A-Za-z0-9_.~-]{1,64}$/.test(path)
  )
    return
  graphQlReply(null)
}
