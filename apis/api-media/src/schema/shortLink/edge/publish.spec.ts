import Cloudflare from 'cloudflare'
import { vi } from 'vitest'

import { prismaMock } from '../../../../test/prismaMock'
import {
  buildShortLink,
  buildShortLinkDomain,
  buildShortLinkWithDomain,
  withRelations
} from '../../../../test/shortLinkFixtures'

import {
  publishDomain,
  publishDomainWithLinks,
  publishLink,
  unpublishDomain,
  unpublishLink
} from './publish'

const kvDelete = vi.fn()
const kvBulkUpdate = vi.fn<
  (
    namespaceId: string,
    params: {
      account_id: string
      body: Array<{ key: string; value: string }>
    }
  ) => Promise<unknown>
>()

vi.mock('cloudflare/shims/web', () => ({}))
vi.mock('cloudflare', () => ({
  // Vitest 4 constructor mocks must be `function`s (docs/agents/testing.md)
  default: vi.fn(function () {
    return {
      kv: {
        namespaces: {
          bulkUpdate: kvBulkUpdate,
          values: { delete: kvDelete }
        }
      }
    }
  })
}))

const logger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
} as unknown as import('pino').Logger

const GLOBAL_NS = 'kv-global'
const DOMAIN_NS = 'kv-domain'

const domainOverrides = {
  id: 'domainId',
  hostname: 'Example.com',
  redirectStatus: 302,
  kvNamespaceId: DOMAIN_NS,
  kvBinding: 'KV_EXAMPLE'
}
const domain = buildShortLinkDomain(domainOverrides)

function linkWithRelations(
  overrides: Parameters<typeof buildShortLink>[0] = {},
  domainOverride: Parameters<typeof buildShortLinkDomain>[0] = domainOverrides,
  relations: { campaigns?: Array<{ id: string }>; ownsClaim?: boolean } = {}
) {
  const link = buildShortLinkWithDomain(overrides, domainOverride)
  return withRelations(link, {
    campaigns: relations.campaigns ?? [],
    globalSlug:
      relations.ownsClaim === true ? { pathname: link.pathname } : null
  })
}

interface KvWrite {
  namespaceId: string
  key: string
  value: string
}

/** Every pair sent to the KV bulk endpoint, flattened in call order. */
function kvWrites(): KvWrite[] {
  return kvBulkUpdate.mock.calls.flatMap(([namespaceId, params]) =>
    params.body.map((pair) => ({ namespaceId, ...pair }))
  )
}

describe('edge publish', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = {
      ...originalEnv,
      CLOUDFLARE_ACCOUNT_ID: 'account',
      CLOUDFLARE_SHORT_LINKS_API_TOKEN: 'token',
      CLOUDFLARE_SHORT_LINKS_KV_NAMESPACE_ID: GLOBAL_NS
    }
    kvDelete.mockResolvedValue({})
    kvBulkUpdate.mockResolvedValue({})
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('when the global KV namespace is not configured', () => {
    beforeEach(() => {
      delete process.env.CLOUDFLARE_SHORT_LINKS_KV_NAMESPACE_ID
    })

    it('every function is a successful no-op', async () => {
      expect(await publishDomain('domainId', prismaMock, logger)).toBeNull()
      expect(await publishLink('linkId', prismaMock, logger)).toBeNull()
      await unpublishLink('linkId', prismaMock, logger)
      await unpublishDomain('example.com', logger)
      expect(
        await publishDomainWithLinks('domainId', prismaMock, logger)
      ).toBeNull()
      expect(kvBulkUpdate).not.toHaveBeenCalled()
      expect(
        prismaMock.shortLinkDomain.findUniqueOrThrow
      ).not.toHaveBeenCalled()
      expect(prismaMock.shortLink.findUniqueOrThrow).not.toHaveBeenCalled()
      expect(logger.debug).toHaveBeenCalled()
    })
  })

  it('throws when the account id or token is missing', async () => {
    delete process.env.CLOUDFLARE_SHORT_LINKS_API_TOKEN
    await expect(publishLink('linkId', prismaMock, logger)).rejects.toThrow(
      'Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_SHORT_LINKS_API_TOKEN'
    )
  })

  it('points the client at CLOUDFLARE_SHORT_LINKS_API_BASE_URL when it is set', async () => {
    process.env.CLOUDFLARE_SHORT_LINKS_API_BASE_URL =
      'http://localhost:8788/client/v4'

    await unpublishDomain('example.com', logger)

    expect(Cloudflare).toHaveBeenCalledWith({
      apiToken: 'token',
      baseURL: 'http://localhost:8788/client/v4'
    })
  })

  describe('publishDomain', () => {
    it('writes the domain record to the global namespace and stamps edgePublishedAt', async () => {
      prismaMock.shortLinkDomain.findUniqueOrThrow.mockResolvedValue(domain)
      prismaMock.shortLinkDomain.update.mockResolvedValue(domain)

      const publishedAt = await publishDomain('domainId', prismaMock, logger)

      expect(publishedAt).toBeInstanceOf(Date)
      expect(kvBulkUpdate).toHaveBeenCalledWith(GLOBAL_NS, {
        account_id: 'account',
        body: [{ key: 'domain:example.com', value: expect.any(String) }]
      })
      expect(JSON.parse(kvWrites()[0].value)).toMatchObject({
        v: 1,
        id: 'domainId',
        hostname: 'example.com',
        redirectStatus: 302,
        kvBinding: 'KV_EXAMPLE'
      })
      expect(prismaMock.shortLinkDomain.update).toHaveBeenCalledWith({
        where: { id: 'domainId' },
        data: { edgePublishedAt: publishedAt }
      })
    })

    it('publishes a domain without its own namespace (global links only)', async () => {
      prismaMock.shortLinkDomain.findUniqueOrThrow.mockResolvedValue(
        buildShortLinkDomain({ id: 'domainId', hostname: 'bare.example' })
      )
      prismaMock.shortLinkDomain.update.mockResolvedValue(domain)

      await publishDomain('domainId', prismaMock, logger)

      expect(kvWrites()).toEqual([
        {
          namespaceId: GLOBAL_NS,
          key: 'domain:bare.example',
          value: expect.any(String)
        }
      ])
      expect(JSON.parse(kvWrites()[0].value).kvBinding).toBeNull()
    })

    it('throws when KV rejects the write and does not stamp edgePublishedAt', async () => {
      prismaMock.shortLinkDomain.findUniqueOrThrow.mockResolvedValue(domain)
      kvBulkUpdate.mockRejectedValue(new Error('kv down'))

      await expect(
        publishDomain('domainId', prismaMock, logger)
      ).rejects.toThrow('kv down')
      expect(prismaMock.shortLinkDomain.update).not.toHaveBeenCalled()
    })

    it('throws when KV reports keys it did not write', async () => {
      prismaMock.shortLinkDomain.findUniqueOrThrow.mockResolvedValue(domain)
      kvBulkUpdate.mockResolvedValue({
        successful_key_count: 0,
        unsuccessful_keys: ['domain:example.com']
      })

      await expect(
        publishDomain('domainId', prismaMock, logger)
      ).rejects.toThrow('KV did not write 1 key(s): domain:example.com')
      expect(prismaMock.shortLinkDomain.update).not.toHaveBeenCalled()
    })
  })

  describe('publishLink', () => {
    it('writes the bare-slug record to the domain namespace', async () => {
      const link = linkWithRelations(
        {
          id: 'linkId',
          pathname: 'AbC',
          to: 'https://dest.example',
          redirectStatus: 301
        },
        domainOverrides,
        { campaigns: [{ id: 'c1' }] }
      )
      prismaMock.shortLink.findUniqueOrThrow.mockResolvedValue(link)
      prismaMock.shortLink.update.mockResolvedValue(link)

      const publishedAt = await publishLink('linkId', prismaMock, logger)

      expect(prismaMock.shortLink.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'linkId' },
        include: {
          domain: true,
          campaigns: { select: { id: true } },
          globalSlug: { select: { pathname: true } }
        }
      })
      expect(kvBulkUpdate).toHaveBeenCalledTimes(1)
      expect(kvBulkUpdate).toHaveBeenCalledWith(DOMAIN_NS, {
        account_id: 'account',
        body: [{ key: 'AbC', value: expect.any(String) }]
      })
      expect(JSON.parse(kvWrites()[0].value)).toEqual({
        v: 1,
        id: 'linkId',
        to: 'https://dest.example',
        status: 301,
        fallbackTo: null,
        paused: false,
        global: false,
        hostname: 'example.com',
        assetClass: 'standard',
        placement: null,
        campaignIds: ['c1'],
        videoId: null,
        youtubeVideoId: null,
        language: null
      })
      expect(prismaMock.shortLink.update).toHaveBeenCalledWith({
        where: { id: 'linkId' },
        data: { edgePublishedAt: publishedAt }
      })
    })

    it('leaves status null when the link has no override (the Worker uses the serving domain)', async () => {
      const link = linkWithRelations({ id: 'linkId' })
      prismaMock.shortLink.findUniqueOrThrow.mockResolvedValue(link)
      prismaMock.shortLink.update.mockResolvedValue(link)

      await publishLink('linkId', prismaMock, logger)

      expect(JSON.parse(kvWrites()[0].value).status).toBeNull()
    })

    it('lower-cases the key on a case-insensitive domain', async () => {
      const link = linkWithRelations(
        { id: 'linkId', pathname: 'AbC' },
        { ...domainOverrides, hostname: 'yt.example', slugCaseSensitive: false }
      )
      prismaMock.shortLink.findUniqueOrThrow.mockResolvedValue(link)
      prismaMock.shortLink.update.mockResolvedValue(link)

      await publishLink('linkId', prismaMock, logger)

      expect(kvWrites()).toEqual([
        { namespaceId: DOMAIN_NS, key: 'abc', value: expect.any(String) }
      ])
    })

    it('also writes link:<pathname> to the global namespace for a global link', async () => {
      const link = linkWithRelations(
        { id: 'linkId', pathname: 'promo', global: true },
        domainOverrides,
        { ownsClaim: true }
      )
      prismaMock.shortLink.findUniqueOrThrow.mockResolvedValue(link)
      prismaMock.shortLink.update.mockResolvedValue(link)

      await publishLink('linkId', prismaMock, logger)

      expect(kvWrites()).toEqual([
        { namespaceId: DOMAIN_NS, key: 'promo', value: expect.any(String) },
        {
          namespaceId: GLOBAL_NS,
          key: 'link:promo',
          value: expect.any(String)
        }
      ])
      expect(JSON.parse(kvWrites()[1].value)).toMatchObject({
        global: true,
        hostname: 'example.com'
      })
      expect(kvDelete).not.toHaveBeenCalled()
    })

    it('publishes only the global key when the domain has no namespace', async () => {
      const link = linkWithRelations(
        { id: 'linkId', pathname: 'promo', global: true },
        { id: 'domainId', hostname: 'bare.example' },
        { ownsClaim: true }
      )
      prismaMock.shortLink.findUniqueOrThrow.mockResolvedValue(link)
      prismaMock.shortLink.update.mockResolvedValue(link)

      const publishedAt = await publishLink('linkId', prismaMock, logger)

      expect(publishedAt).toBeInstanceOf(Date)
      expect(kvWrites()).toEqual([
        {
          namespaceId: GLOBAL_NS,
          key: 'link:promo',
          value: expect.any(String)
        }
      ])
    })

    it('skips silently when the domain has no namespace and the link is not global', async () => {
      const link = linkWithRelations(
        { id: 'linkId' },
        { id: 'domainId', hostname: 'bare.example' }
      )
      prismaMock.shortLink.findUniqueOrThrow.mockResolvedValue(link)

      expect(await publishLink('linkId', prismaMock, logger)).toBeNull()

      expect(kvBulkUpdate).not.toHaveBeenCalled()
      expect(kvDelete).not.toHaveBeenCalled()
      expect(prismaMock.shortLink.update).not.toHaveBeenCalled()
      expect(logger.debug).toHaveBeenCalled()
    })

    it('deletes both keys for a retired global link that owns its claim', async () => {
      const link = linkWithRelations(
        {
          id: 'linkId',
          pathname: 'gone',
          global: true,
          status: 'retired',
          deletedAt: new Date()
        },
        domainOverrides,
        { ownsClaim: true }
      )
      prismaMock.shortLink.findUniqueOrThrow.mockResolvedValue(link)
      prismaMock.shortLink.update.mockResolvedValue(link)

      await publishLink('linkId', prismaMock, logger)

      expect(kvBulkUpdate).not.toHaveBeenCalled()
      expect(kvDelete).toHaveBeenCalledWith(DOMAIN_NS, 'gone', {
        account_id: 'account'
      })
      expect(kvDelete).toHaveBeenCalledWith(GLOBAL_NS, 'link:gone', {
        account_id: 'account'
      })
    })

    it('removes the global key for an un-flagged link that still owns its claim', async () => {
      const link = linkWithRelations(
        { id: 'linkId', pathname: 'promo', global: false },
        domainOverrides,
        { ownsClaim: true }
      )
      prismaMock.shortLink.findUniqueOrThrow.mockResolvedValue(link)
      prismaMock.shortLink.update.mockResolvedValue(link)

      await publishLink('linkId', prismaMock, logger)

      expect(kvWrites()).toEqual([
        { namespaceId: DOMAIN_NS, key: 'promo', value: expect.any(String) }
      ])
      expect(kvDelete).toHaveBeenCalledTimes(1)
      expect(kvDelete).toHaveBeenCalledWith(GLOBAL_NS, 'link:promo', {
        account_id: 'account'
      })
    })

    it('never touches a global key it does not own', async () => {
      const link = linkWithRelations({ id: 'linkId', pathname: 'promo' })
      prismaMock.shortLink.findUniqueOrThrow.mockResolvedValue(link)
      prismaMock.shortLink.update.mockResolvedValue(link)

      await publishLink('linkId', prismaMock, logger)

      expect(kvDelete).not.toHaveBeenCalled()
      expect(kvBulkUpdate).toHaveBeenCalledTimes(1)
    })

    it('throws when KV rejects the write', async () => {
      prismaMock.shortLink.findUniqueOrThrow.mockResolvedValue(
        linkWithRelations({ id: 'linkId' })
      )
      kvBulkUpdate.mockRejectedValue(new Error('kv down'))

      await expect(publishLink('linkId', prismaMock, logger)).rejects.toThrow(
        'kv down'
      )
      expect(prismaMock.shortLink.update).not.toHaveBeenCalled()
    })
  })

  describe('unpublishLink', () => {
    it('deletes the domain key, the owned global key and both replica rows', async () => {
      prismaMock.shortLink.findUniqueOrThrow.mockResolvedValue(
        withRelations(
          buildShortLinkWithDomain(
            { id: 'linkId', pathname: 'p1', global: true },
            domainOverrides
          ),
          { globalSlug: { pathname: 'p1' } }
        )
      )

      await unpublishLink('linkId', prismaMock, logger)

      expect(kvDelete).toHaveBeenCalledWith(DOMAIN_NS, 'p1', {
        account_id: 'account'
      })
      expect(kvDelete).toHaveBeenCalledWith(GLOBAL_NS, 'link:p1', {
        account_id: 'account'
      })
    })

    it('deletes nothing for a non-global link on a domain without a namespace', async () => {
      prismaMock.shortLink.findUniqueOrThrow.mockResolvedValue(
        withRelations(
          buildShortLinkWithDomain(
            { id: 'linkId' },
            { id: 'domainId', hostname: 'bare.example' }
          ),
          { globalSlug: null }
        )
      )

      await unpublishLink('linkId', prismaMock, logger)

      expect(kvDelete).not.toHaveBeenCalled()
    })
  })

  describe('unpublishDomain', () => {
    it('deletes the domain record from the global namespace', async () => {
      await unpublishDomain('Example.com', logger)
      expect(kvDelete).toHaveBeenCalledWith(GLOBAL_NS, 'domain:example.com', {
        account_id: 'account'
      })
    })
  })

  describe('publishDomainWithLinks', () => {
    const links = [
      { ...buildShortLink({ id: 'a', pathname: 'one' }), campaigns: [] },
      {
        ...buildShortLink({
          id: 'b',
          pathname: 'two',
          status: 'paused',
          global: true
        }),
        campaigns: [{ id: 'c1' }]
      }
    ]

    it('bulk-writes the domain namespace and refreshes global keys', async () => {
      prismaMock.shortLinkDomain.findUniqueOrThrow.mockResolvedValue(domain)
      prismaMock.shortLinkDomain.update.mockResolvedValue(domain)
      prismaMock.shortLink.findMany.mockResolvedValue(links)
      prismaMock.shortLink.updateMany.mockResolvedValue({ count: 2 })

      const publishedAt = await publishDomainWithLinks(
        'domainId',
        prismaMock,
        logger
      )

      expect(publishedAt).toBeInstanceOf(Date)
      expect(prismaMock.shortLink.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            domainId: 'domainId',
            deletedAt: null,
            status: { not: 'retired' }
          }
        })
      )
      expect(kvBulkUpdate).toHaveBeenCalledTimes(3)
      expect(kvBulkUpdate).toHaveBeenNthCalledWith(1, GLOBAL_NS, {
        account_id: 'account',
        body: [{ key: 'domain:example.com', value: expect.any(String) }]
      })
      expect(kvBulkUpdate).toHaveBeenNthCalledWith(2, DOMAIN_NS, {
        account_id: 'account',
        body: [
          { key: 'one', value: expect.any(String) },
          { key: 'two', value: expect.any(String) }
        ]
      })
      expect(kvBulkUpdate).toHaveBeenNthCalledWith(3, GLOBAL_NS, {
        account_id: 'account',
        body: [{ key: 'link:two', value: expect.any(String) }]
      })
      expect(
        JSON.parse(kvBulkUpdate.mock.calls[1][1].body[1].value)
      ).toMatchObject({
        id: 'b',
        paused: true,
        global: true,
        campaignIds: ['c1'],
        status: null,
        hostname: 'example.com'
      })
      expect(prismaMock.shortLink.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['a', 'b'] } },
        data: { edgePublishedAt: publishedAt }
      })
    })

    it('publishes only the global links of a domain without a namespace', async () => {
      const bareDomain = buildShortLinkDomain({
        id: 'domainId',
        hostname: 'bare.example'
      })
      prismaMock.shortLinkDomain.findUniqueOrThrow.mockResolvedValue(bareDomain)
      prismaMock.shortLinkDomain.update.mockResolvedValue(bareDomain)
      prismaMock.shortLink.findMany.mockResolvedValue(links)
      prismaMock.shortLink.updateMany.mockResolvedValue({ count: 1 })

      await publishDomainWithLinks('domainId', prismaMock, logger)

      expect(
        kvWrites().map(({ namespaceId, key }) => [namespaceId, key])
      ).toEqual([
        [GLOBAL_NS, 'domain:bare.example'],
        [GLOBAL_NS, 'link:two']
      ])
      expect(prismaMock.shortLink.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['b'] } },
        data: { edgePublishedAt: expect.any(Date) }
      })
    })
  })
})
