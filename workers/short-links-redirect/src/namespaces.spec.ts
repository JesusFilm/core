import { createExecutionContext } from 'cloudflare:test'

import { fetchMock } from '../test/fetchMock'
import { domainRecord, routingRecord } from '../test/fixtures'
import {
  bindings,
  graphQlEndpoint,
  seedDomainLinks,
  seedRecords,
  workerRequest
} from '../test/workerRequest'

import type { Env } from './env'
import type { ShortLinkByPathData } from './graphql'
import {
  clearDomainCache,
  clearMissingBindingLog,
  domainNamespace,
  lookupLink
} from './store'

const jesusFilm = domainRecord({
  hostname: 'jesus.film',
  redirectStatus: 302,
  kvBinding: 'KV_JESUS_FILM'
})

const noNamespace = domainRecord({
  hostname: 'nons.example',
  redirectStatus: 308,
  kvBinding: null
})

const unbound = domainRecord({
  hostname: 'unbound.example',
  kvBinding: 'KV_NOT_IN_WRANGLER'
})

function apiLink(overrides: Partial<ShortLinkByPathData>): ShortLinkByPathData {
  return {
    id: 'link-api',
    to: 'https://example.com/api',
    status: 'active',
    redirectStatus: null,
    fallbackTo: null,
    assetClass: 'standard',
    placement: null,
    videoId: null,
    youtubeVideoId: null,
    language: null,
    global: false,
    brightcoveId: null,
    redirectType: null,
    campaigns: [],
    domain: {
      hostname: 'jesus.film',
      redirectStatus: 302,
      fallbackTo: null,
      passthroughOrigin: null
    },
    ...overrides
  }
}

function graphQlReply(link: ShortLinkByPathData | null): void {
  fetchMock
    .get(graphQlEndpoint)
    .intercept({ path: '/', method: 'POST' })
    .reply(() => ({
      statusCode: 200,
      data: JSON.stringify({
        data: {
          shortLinkByPath:
            link == null
              ? { __typename: 'NotFoundError' }
              : { __typename: 'QueryShortLinkByPathSuccess', data: link }
        }
      })
    }))
}

describe('domainNamespace', () => {
  beforeEach(() => clearMissingBindingLog())

  it('returns the bound namespace named by the domain record', () => {
    expect(domainNamespace(bindings, jesusFilm)).toBe(bindings.KV_JESUS_FILM)
  })

  it('returns null for a domain without a binding, silently', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    expect(domainNamespace(bindings, noNamespace)).toBeNull()
    expect(error).not.toHaveBeenCalled()
    error.mockRestore()
  })

  it('logs a missing binding once per isolate and returns null', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    expect(domainNamespace(bindings, unbound)).toBeNull()
    expect(domainNamespace(bindings, unbound)).toBeNull()
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenCalledWith(
      JSON.stringify({
        event: 'missing_binding',
        binding: 'KV_NOT_IN_WRANGLER'
      })
    )
    error.mockRestore()
  })

  it('rejects a binding that is not a KV namespace', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const testEnv: Env = { ...bindings, KV_STRING: 'not a namespace' }

    expect(domainNamespace(testEnv, { kvBinding: 'KV_STRING' })).toBeNull()
    expect(
      domainNamespace(testEnv, { kvBinding: 'CORE_GRAPHQL_ENDPOINT' })
    ).toBeNull()
    expect(error).toHaveBeenCalledTimes(2)
    error.mockRestore()
  })
})

describe('two-tier namespaces', () => {
  beforeAll(async () => {
    fetchMock.activate()
    await seedRecords({
      'domain:jesus.film': jesusFilm,
      'domain:nons.example': noNamespace,
      'domain:unbound.example': unbound,
      // Global links live in the global namespace under `link:<slug>`.
      'link:everywhere': routingRecord({
        id: 'link-global',
        to: 'https://example.com/global',
        global: true,
        hostname: 'nxstp.is'
      }),
      'link:both': routingRecord({
        id: 'link-global-both',
        to: 'https://example.com/global-both',
        global: true,
        hostname: 'nxstp.is'
      }),
      'link:withstatus': routingRecord({
        id: 'link-global-status',
        to: 'https://example.com/global-status',
        status: 301,
        global: true,
        hostname: 'nxstp.is'
      })
    })
    await seedDomainLinks('KV_JESUS_FILM', {
      own: routingRecord({
        id: 'link-own',
        to: 'https://example.com/own',
        hostname: 'jesus.film'
      }),
      both: routingRecord({
        id: 'link-own-both',
        to: 'https://example.com/own-both',
        hostname: 'jesus.film'
      })
    })
    // A slug that only exists in another domain's namespace must not leak.
    await seedDomainLinks('KV_NXSTP_IS', {
      elsewhere: routingRecord({
        id: 'link-elsewhere',
        to: 'https://example.com/elsewhere',
        hostname: 'nxstp.is'
      })
    })
  })

  afterAll(() => fetchMock.deactivate())

  beforeEach(() => {
    clearDomainCache()
    clearMissingBindingLog()
  })

  afterEach(() => fetchMock.assertNoPendingInterceptors())

  it('serves a hit from the domain namespace', async () => {
    const { response, sent } = await workerRequest('https://jesus.film/own')

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('https://example.com/own')
    expect(sent[0]).toMatchObject({
      linkId: 'link-own',
      resolvedFrom: 'kv',
      global: false,
      ownerHostname: 'jesus.film'
    })
  })

  it('falls back to the global namespace when the domain namespace misses', async () => {
    const { response, sent } = await workerRequest(
      'https://jesus.film/everywhere'
    )

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('https://example.com/global')
    expect(sent[0]).toMatchObject({
      hostname: 'jesus.film',
      linkId: 'link-global',
      resolvedFrom: 'kv-global',
      global: true,
      ownerHostname: 'nxstp.is'
    })
  })

  it('prefers the domain namespace when both have the slug', async () => {
    const { response, sent } = await workerRequest('https://jesus.film/both')

    expect(response.headers.get('location')).toBe(
      'https://example.com/own-both'
    )
    expect(sent[0]?.resolvedFrom).toBe('kv')
  })

  it('takes the serving domain status for a global link without its own', async () => {
    const { response } = await workerRequest('https://nons.example/everywhere')

    expect(response.status).toBe(308)
  })

  it('keeps a global link own status override', async () => {
    const { response } = await workerRequest('https://jesus.film/withstatus')

    expect(response.status).toBe(301)
  })

  it('never reads another domain namespace', async () => {
    graphQlReply(null)
    const { response } = await workerRequest('https://jesus.film/elsewhere')

    expect(response.status).toBe(404)
  })

  it('serves a domain without a namespace from global and api only', async () => {
    const viaGlobal = await workerRequest('https://nons.example/everywhere')
    expect(viaGlobal.sent[0]?.resolvedFrom).toBe('kv-global')

    graphQlReply(null)
    const miss = await workerRequest('https://nons.example/own')
    expect(miss.response.status).toBe(404)
  })

  it('logs a missing binding once and continues to the global namespace', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const first = await workerRequest('https://unbound.example/everywhere')
    const second = await workerRequest('https://unbound.example/everywhere')

    expect(first.response.status).toBe(307)
    expect(second.response.status).toBe(307)
    expect(first.sent[0]?.resolvedFrom).toBe('kv-global')
    expect(
      error.mock.calls.filter(([message]) =>
        String(message).includes('missing_binding')
      )
    ).toHaveLength(1)
    error.mockRestore()
  })

  describe('api-media write-back', () => {
    it('writes a link of this domain to the domain namespace', async () => {
      const log = vi.spyOn(console, 'log').mockImplementation(() => undefined)
      graphQlReply(apiLink({ id: 'link-api-own' }))

      const { response, sent } = await workerRequest(
        'https://jesus.film/api-own'
      )

      expect(response.status).toBe(302)
      expect(sent[0]).toMatchObject({
        resolvedFrom: 'api',
        global: false,
        ownerHostname: 'jesus.film'
      })
      expect(
        await bindings.KV_JESUS_FILM?.get('api-own', 'json')
      ).toMatchObject({ id: 'link-api-own', hostname: 'jesus.film' })
      expect(
        await bindings.SHORT_LINKS_KV.get('link:api-own', 'json')
      ).toBeNull()
      expect(log).toHaveBeenCalledWith(
        JSON.stringify({
          event: 'publish_gap',
          key: 'link:jesus.film/api-own',
          target: 'KV_JESUS_FILM'
        })
      )
      log.mockRestore()
    })

    it('writes a global link of another domain to the global namespace', async () => {
      const log = vi.spyOn(console, 'log').mockImplementation(() => undefined)
      graphQlReply(
        apiLink({
          id: 'link-api-global',
          global: true,
          domain: {
            hostname: 'nxstp.is',
            redirectStatus: 307,
            fallbackTo: null,
            passthroughOrigin: null
          }
        })
      )

      const { sent } = await workerRequest('https://jesus.film/api-global')

      expect(sent[0]).toMatchObject({
        resolvedFrom: 'api',
        global: true,
        ownerHostname: 'nxstp.is'
      })
      expect(
        await bindings.SHORT_LINKS_KV.get('link:api-global', 'json')
      ).toMatchObject({ id: 'link-api-global', global: true })
      expect(await bindings.KV_JESUS_FILM?.get('api-global', 'json')).toBeNull()
      expect(log).toHaveBeenCalledWith(
        JSON.stringify({
          event: 'publish_gap',
          key: 'link:jesus.film/api-global',
          target: 'SHORT_LINKS_KV'
        })
      )
      log.mockRestore()
    })

    it('writes a global link of this domain to the domain namespace', async () => {
      graphQlReply(apiLink({ id: 'link-api-own-global', global: true }))

      await workerRequest('https://jesus.film/api-own-global')

      expect(
        await bindings.KV_JESUS_FILM?.get('api-own-global', 'json')
      ).toMatchObject({ id: 'link-api-own-global', global: true })
      expect(
        await bindings.SHORT_LINKS_KV.get('link:api-own-global', 'json')
      ).toBeNull()
    })

    it('writes a global link to the global namespace when the domain has no binding', async () => {
      graphQlReply(
        apiLink({
          id: 'link-api-nons',
          global: true,
          domain: {
            hostname: 'nons.example',
            redirectStatus: 308,
            fallbackTo: null,
            passthroughOrigin: null
          }
        })
      )

      const { response } = await workerRequest('https://nons.example/api-nons')

      expect(response.status).toBe(308)
      expect(
        await bindings.SHORT_LINKS_KV.get('link:api-nons', 'json')
      ).toMatchObject({ id: 'link-api-nons' })
    })

    it('writes nothing for a non-global link of another domain', async () => {
      const log = vi.spyOn(console, 'log').mockImplementation(() => undefined)
      graphQlReply(
        apiLink({
          id: 'link-api-foreign',
          domain: {
            hostname: 'nxstp.is',
            redirectStatus: 307,
            fallbackTo: null,
            passthroughOrigin: null
          }
        })
      )

      const { response, sent } = await workerRequest(
        'https://jesus.film/api-foreign'
      )

      expect(response.status).toBe(302)
      expect(sent[0]?.resolvedFrom).toBe('api')
      expect(
        await bindings.KV_JESUS_FILM?.get('api-foreign', 'json')
      ).toBeNull()
      expect(
        await bindings.SHORT_LINKS_KV.get('link:api-foreign', 'json')
      ).toBeNull()
      expect(log).toHaveBeenCalledWith(
        JSON.stringify({
          event: 'publish_gap',
          key: 'link:jesus.film/api-foreign',
          target: null
        })
      )
      log.mockRestore()
    })

    it('writes nothing for a link of this domain when the binding is missing', async () => {
      const error = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined)
      graphQlReply(
        apiLink({
          id: 'link-api-unbound',
          domain: {
            hostname: 'unbound.example',
            redirectStatus: 307,
            fallbackTo: null,
            passthroughOrigin: null
          }
        })
      )

      const { response } = await workerRequest(
        'https://unbound.example/api-unbound'
      )

      expect(response.status).toBe(307)
      expect(
        await bindings.SHORT_LINKS_KV.get('link:api-unbound', 'json')
      ).toBeNull()
      error.mockRestore()
    })

    it('uses the domain status for an api-media link without an override', async () => {
      graphQlReply(apiLink({ id: 'link-api-status', redirectStatus: null }))

      const { response } = await workerRequest('https://jesus.film/api-status')

      expect(response.status).toBe(302)
    })
  })

  it('exposes the lookup order through lookupLink directly', async () => {
    const ctx = createExecutionContext()

    expect(await lookupLink(bindings, ctx, jesusFilm, 'own')).toMatchObject({
      resolvedFrom: 'kv'
    })
    expect(
      await lookupLink(bindings, ctx, jesusFilm, 'everywhere')
    ).toMatchObject({ resolvedFrom: 'kv-global' })
    expect(await lookupLink(bindings, ctx, noNamespace, 'own')).toBeNull()
  })
})
