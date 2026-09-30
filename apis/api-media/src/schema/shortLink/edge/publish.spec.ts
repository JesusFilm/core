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

const kvUpdate = vi.fn()
const kvDelete = vi.fn()
const kvBulkUpdate = vi.fn()
const d1Query = vi.fn()

vi.mock('cloudflare/shims/web', () => ({}))
vi.mock('cloudflare', () => ({
  // Vitest 4 constructor mocks must be `function`s (docs/agents/testing.md)
  default: vi.fn(function () {
    return {
      kv: {
        namespaces: {
          bulkUpdate: kvBulkUpdate,
          values: { update: kvUpdate, delete: kvDelete }
        }
      },
      d1: { database: { query: d1Query } }
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

function d1Calls(): Array<{ sql: string; params: string[] }> {
  return d1Query.mock.calls.map(([, params]) => params)
}

describe('edge publish', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = {
      ...originalEnv,
      CLOUDFLARE_ACCOUNT_ID: 'account',
      CLOUDFLARE_SHORT_LINKS_API_TOKEN: 'token',
      CLOUDFLARE_SHORT_LINKS_KV_NAMESPACE_ID: GLOBAL_NS,
      CLOUDFLARE_SHORT_LINKS_D1_DATABASE_ID: 'd1'
    }
    kvUpdate.mockResolvedValue({})
    kvDelete.mockResolvedValue({})
    kvBulkUpdate.mockResolvedValue({})
    d1Query.mockResolvedValue([])
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
      expect(kvUpdate).not.toHaveBeenCalled()
      expect(d1Query).not.toHaveBeenCalled()
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

  describe('publishDomain', () => {
    it('writes the domain record to the global namespace and D1 and stamps edgePublishedAt', async () => {
      prismaMock.shortLinkDomain.findUniqueOrThrow.mockResolvedValue(domain)
      prismaMock.shortLinkDomain.update.mockResolvedValue(domain)

      const publishedAt = await publishDomain('domainId', prismaMock, logger)

      expect(publishedAt).toBeInstanceOf(Date)
      expect(kvUpdate).toHaveBeenCalledWith(GLOBAL_NS, 'domain:example.com', {
        account_id: 'account',
        value: expect.any(String),
        metadata: '{}'
      })
      expect(JSON.parse(kvUpdate.mock.calls[0][2].value)).toMatchObject({
        v: 1,
        id: 'domainId',
        hostname: 'example.com',
        redirectStatus: 302,
        kvBinding: 'KV_EXAMPLE'
      })
      expect(d1Query).toHaveBeenCalledWith('d1', {
        account_id: 'account',
        sql: expect.stringContaining('INSERT INTO short_link_records'),
        params: ['domain:example.com', expect.any(String), expect.any(String)]
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

      expect(kvUpdate).toHaveBeenCalledWith(
        GLOBAL_NS,
        'domain:bare.example',
        expect.anything()
      )
      expect(JSON.parse(kvUpdate.mock.calls[0][2].value).kvBinding).toBeNull()
    })

    it('skips D1 when the database id is unset', async () => {
      delete process.env.CLOUDFLARE_SHORT_LINKS_D1_DATABASE_ID
      prismaMock.shortLinkDomain.findUniqueOrThrow.mockResolvedValue(domain)
      prismaMock.shortLinkDomain.update.mockResolvedValue(domain)

      await publishDomain('domainId', prismaMock, logger)

      expect(kvUpdate).toHaveBeenCalledTimes(1)
      expect(d1Query).not.toHaveBeenCalled()
    })

    it('throws when KV rejects the write and does not stamp edgePublishedAt', async () => {
      prismaMock.shortLinkDomain.findUniqueOrThrow.mockResolvedValue(domain)
      kvUpdate.mockRejectedValue(new Error('kv down'))

      await expect(
        publishDomain('domainId', prismaMock, logger)
      ).rejects.toThrow('kv down')
      expect(prismaMock.shortLinkDomain.update).not.toHaveBeenCalled()
    })

    it('logs and swallows D1 failures', async () => {
      prismaMock.shortLinkDomain.findUniqueOrThrow.mockResolvedValue(domain)
      prismaMock.shortLinkDomain.update.mockResolvedValue(domain)
      d1Query.mockRejectedValue(new Error('d1 down'))

      await expect(
        publishDomain('domainId', prismaMock, logger)
      ).resolves.toBeInstanceOf(Date)
      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(Error) }),
        'short link edge: D1 write failed'
      )
    })
  })

  describe('publishLink', () => {
    it('writes the bare-slug record to the domain namespace and the replica', async () => {
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
      expect(kvUpdate).toHaveBeenCalledTimes(1)
      expect(kvUpdate).toHaveBeenCalledWith(
        DOMAIN_NS,
        'AbC',
        expect.objectContaining({ account_id: 'account' })
      )
      expect(JSON.parse(kvUpdate.mock.calls[0][2].value)).toEqual({
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
      expect(d1Calls()).toEqual([
        expect.objectContaining({
          params: [
            'link:example.com/AbC',
            expect.any(String),
            expect.any(String)
          ]
        })
      ])
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

      expect(JSON.parse(kvUpdate.mock.calls[0][2].value).status).toBeNull()
    })

    it('lower-cases the key on a case-insensitive domain', async () => {
      const link = linkWithRelations(
        { id: 'linkId', pathname: 'AbC' },
        { ...domainOverrides, hostname: 'yt.example', slugCaseSensitive: false }
      )
      prismaMock.shortLink.findUniqueOrThrow.mockResolvedValue(link)
      prismaMock.shortLink.update.mockResolvedValue(link)

      await publishLink('linkId', prismaMock, logger)

      expect(kvUpdate).toHaveBeenCalledWith(DOMAIN_NS, 'abc', expect.anything())
      expect(d1Calls()[0].params[0]).toBe('link:yt.example/abc')
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

      expect(kvUpdate).toHaveBeenCalledTimes(2)
      expect(kvUpdate).toHaveBeenNthCalledWith(
        1,
        DOMAIN_NS,
        'promo',
        expect.anything()
      )
      expect(kvUpdate).toHaveBeenNthCalledWith(
        2,
        GLOBAL_NS,
        'link:promo',
        expect.anything()
      )
      expect(JSON.parse(kvUpdate.mock.calls[1][2].value)).toMatchObject({
        global: true,
        hostname: 'example.com'
      })
      expect(d1Calls().map(({ params }) => params[0])).toEqual([
        'link:example.com/promo',
        'global:promo'
      ])
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
      expect(kvUpdate).toHaveBeenCalledTimes(1)
      expect(kvUpdate).toHaveBeenCalledWith(
        GLOBAL_NS,
        'link:promo',
        expect.anything()
      )
      expect(d1Calls().map(({ params }) => params[0])).toEqual(['global:promo'])
    })

    it('skips silently when the domain has no namespace and the link is not global', async () => {
      const link = linkWithRelations(
        { id: 'linkId' },
        { id: 'domainId', hostname: 'bare.example' }
      )
      prismaMock.shortLink.findUniqueOrThrow.mockResolvedValue(link)

      expect(await publishLink('linkId', prismaMock, logger)).toBeNull()

      expect(kvUpdate).not.toHaveBeenCalled()
      expect(kvDelete).not.toHaveBeenCalled()
      expect(d1Query).not.toHaveBeenCalled()
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

      expect(kvUpdate).not.toHaveBeenCalled()
      expect(kvDelete).toHaveBeenCalledWith(DOMAIN_NS, 'gone', {
        account_id: 'account'
      })
      expect(kvDelete).toHaveBeenCalledWith(GLOBAL_NS, 'link:gone', {
        account_id: 'account'
      })
      expect(d1Calls()).toEqual([
        {
          account_id: 'account',
          sql: 'DELETE FROM short_link_records WHERE key = ?',
          params: ['link:example.com/gone']
        },
        {
          account_id: 'account',
          sql: 'DELETE FROM short_link_records WHERE key = ?',
          params: ['global:gone']
        }
      ])
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

      expect(kvUpdate).toHaveBeenCalledTimes(1)
      expect(kvUpdate).toHaveBeenCalledWith(
        DOMAIN_NS,
        'promo',
        expect.anything()
      )
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
      expect(kvUpdate).toHaveBeenCalledTimes(1)
    })

    it('throws when KV rejects the write', async () => {
      prismaMock.shortLink.findUniqueOrThrow.mockResolvedValue(
        linkWithRelations({ id: 'linkId' })
      )
      kvUpdate.mockRejectedValue(new Error('kv down'))

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
      expect(d1Calls().map(({ params }) => params[0])).toEqual([
        'link:example.com/p1',
        'global:p1'
      ])
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
      expect(d1Query).not.toHaveBeenCalled()
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
      expect(kvUpdate).toHaveBeenCalledWith(
        GLOBAL_NS,
        'domain:example.com',
        expect.anything()
      )
      expect(prismaMock.shortLink.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            domainId: 'domainId',
            deletedAt: null,
            status: { not: 'retired' }
          }
        })
      )
      expect(kvBulkUpdate).toHaveBeenCalledTimes(2)
      expect(kvBulkUpdate).toHaveBeenNthCalledWith(1, DOMAIN_NS, {
        account_id: 'account',
        body: [
          { key: 'one', value: expect.any(String) },
          { key: 'two', value: expect.any(String) }
        ]
      })
      expect(kvBulkUpdate).toHaveBeenNthCalledWith(2, GLOBAL_NS, {
        account_id: 'account',
        body: [{ key: 'link:two', value: expect.any(String) }]
      })
      expect(
        JSON.parse(kvBulkUpdate.mock.calls[0][1].body[1].value)
      ).toMatchObject({
        id: 'b',
        paused: true,
        global: true,
        campaignIds: ['c1'],
        status: null,
        hostname: 'example.com'
      })
      // one D1 statement for the domain, one multi-row statement for the
      // two domain rows plus the global row
      expect(d1Query).toHaveBeenCalledTimes(2)
      expect(d1Calls()[1].params).toHaveLength(9)
      expect(d1Calls()[1].params.filter((_, i) => i % 3 === 0)).toEqual([
        'link:example.com/one',
        'link:example.com/two',
        'global:two'
      ])
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

      expect(kvBulkUpdate).toHaveBeenCalledTimes(1)
      expect(kvBulkUpdate).toHaveBeenCalledWith(GLOBAL_NS, {
        account_id: 'account',
        body: [{ key: 'link:two', value: expect.any(String) }]
      })
      expect(d1Calls()[1].params[0]).toBe('global:two')
      expect(prismaMock.shortLink.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['b'] } },
        data: { edgePublishedAt: expect.any(Date) }
      })
    })
  })
})
