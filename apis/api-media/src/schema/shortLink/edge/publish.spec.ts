import { vi } from 'vitest'

import { prismaMock } from '../../../../test/prismaMock'
import {
  buildShortLink,
  buildShortLinkDomain,
  buildShortLinkWithDomain
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

const domain = buildShortLinkDomain({
  id: 'domainId',
  hostname: 'Example.com',
  redirectStatus: 302
})

describe('edge publish', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = {
      ...originalEnv,
      CLOUDFLARE_ACCOUNT_ID: 'account',
      CLOUDFLARE_SHORT_LINKS_API_TOKEN: 'token',
      CLOUDFLARE_SHORT_LINKS_KV_NAMESPACE_ID: 'kv',
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

  describe('when the KV namespace is not configured', () => {
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
    it('writes the domain record to KV and D1 and stamps edgePublishedAt', async () => {
      prismaMock.shortLinkDomain.findUniqueOrThrow.mockResolvedValue(domain)
      prismaMock.shortLinkDomain.update.mockResolvedValue(domain)

      const publishedAt = await publishDomain('domainId', prismaMock, logger)

      expect(publishedAt).toBeInstanceOf(Date)
      expect(kvUpdate).toHaveBeenCalledWith('kv', 'domain:example.com', {
        account_id: 'account',
        value: expect.any(String),
        metadata: '{}'
      })
      expect(JSON.parse(kvUpdate.mock.calls[0][2].value)).toMatchObject({
        v: 1,
        id: 'domainId',
        hostname: 'example.com',
        redirectStatus: 302
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
    it('writes the routing record under the lower-cased hostname key', async () => {
      const link = {
        ...buildShortLinkWithDomain(
          { id: 'linkId', pathname: 'AbC', to: 'https://dest.example' },
          { hostname: 'Example.com', redirectStatus: 302 }
        ),
        campaigns: [{ id: 'c1' }]
      }
      prismaMock.shortLink.findUniqueOrThrow.mockResolvedValue(link)
      prismaMock.shortLink.update.mockResolvedValue(link)

      const publishedAt = await publishLink('linkId', prismaMock, logger)

      expect(prismaMock.shortLink.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'linkId' },
        include: { domain: true, campaigns: { select: { id: true } } }
      })
      expect(kvUpdate).toHaveBeenCalledWith(
        'kv',
        'link:example.com/AbC',
        expect.objectContaining({ account_id: 'account' })
      )
      expect(JSON.parse(kvUpdate.mock.calls[0][2].value)).toEqual({
        v: 1,
        id: 'linkId',
        to: 'https://dest.example',
        status: 302,
        fallbackTo: null,
        paused: false,
        assetClass: 'standard',
        placement: null,
        campaignIds: ['c1'],
        videoId: null,
        youtubeVideoId: null,
        language: null
      })
      expect(d1Query).toHaveBeenCalledTimes(1)
      expect(prismaMock.shortLink.update).toHaveBeenCalledWith({
        where: { id: 'linkId' },
        data: { edgePublishedAt: publishedAt }
      })
    })

    it('lower-cases the pathname key on a case-insensitive domain', async () => {
      const link = {
        ...buildShortLinkWithDomain(
          { id: 'linkId', pathname: 'AbC' },
          { hostname: 'yt.example', slugCaseSensitive: false }
        ),
        campaigns: []
      }
      prismaMock.shortLink.findUniqueOrThrow.mockResolvedValue(link)
      prismaMock.shortLink.update.mockResolvedValue(link)

      await publishLink('linkId', prismaMock, logger)

      expect(kvUpdate).toHaveBeenCalledWith(
        'kv',
        'link:yt.example/abc',
        expect.anything()
      )
    })

    it('deletes the record instead when the link is retired or deleted', async () => {
      const link = {
        ...buildShortLinkWithDomain({
          id: 'linkId',
          pathname: 'gone',
          status: 'retired',
          deletedAt: new Date()
        }),
        campaigns: []
      }
      prismaMock.shortLink.findUniqueOrThrow.mockResolvedValue(link)
      prismaMock.shortLink.update.mockResolvedValue(link)

      await publishLink('linkId', prismaMock, logger)

      expect(kvUpdate).not.toHaveBeenCalled()
      expect(kvDelete).toHaveBeenCalledWith('kv', 'link:example.com/gone', {
        account_id: 'account'
      })
      expect(d1Query).toHaveBeenCalledWith('d1', {
        account_id: 'account',
        sql: 'DELETE FROM short_link_records WHERE key = ?',
        params: ['link:example.com/gone']
      })
    })

    it('throws when KV rejects the write', async () => {
      const link = {
        ...buildShortLinkWithDomain({ id: 'linkId' }),
        campaigns: []
      }
      prismaMock.shortLink.findUniqueOrThrow.mockResolvedValue(link)
      kvUpdate.mockRejectedValue(new Error('kv down'))

      await expect(publishLink('linkId', prismaMock, logger)).rejects.toThrow(
        'kv down'
      )
      expect(prismaMock.shortLink.update).not.toHaveBeenCalled()
    })
  })

  describe('unpublishLink', () => {
    it('deletes the KV and D1 records', async () => {
      prismaMock.shortLink.findUniqueOrThrow.mockResolvedValue(
        buildShortLinkWithDomain({ id: 'linkId', pathname: 'p1' })
      )

      await unpublishLink('linkId', prismaMock, logger)

      expect(kvDelete).toHaveBeenCalledWith('kv', 'link:example.com/p1', {
        account_id: 'account'
      })
      expect(d1Query).toHaveBeenCalledWith(
        'd1',
        expect.objectContaining({ params: ['link:example.com/p1'] })
      )
    })
  })

  describe('unpublishDomain', () => {
    it('deletes the domain record', async () => {
      await unpublishDomain('Example.com', logger)
      expect(kvDelete).toHaveBeenCalledWith('kv', 'domain:example.com', {
        account_id: 'account'
      })
    })
  })

  describe('publishDomainWithLinks', () => {
    it('publishes the domain then bulk-writes every live link', async () => {
      prismaMock.shortLinkDomain.findUniqueOrThrow.mockResolvedValue(domain)
      prismaMock.shortLinkDomain.update.mockResolvedValue(domain)
      const links = [
        { ...buildShortLink({ id: 'a', pathname: 'one' }), campaigns: [] },
        {
          ...buildShortLink({ id: 'b', pathname: 'two', status: 'paused' }),
          campaigns: [{ id: 'c1' }]
        }
      ]
      prismaMock.shortLink.findMany.mockResolvedValue(links)
      prismaMock.shortLink.updateMany.mockResolvedValue({ count: 2 })

      const publishedAt = await publishDomainWithLinks(
        'domainId',
        prismaMock,
        logger
      )

      expect(publishedAt).toBeInstanceOf(Date)
      expect(kvUpdate).toHaveBeenCalledWith(
        'kv',
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
      expect(kvBulkUpdate).toHaveBeenCalledWith('kv', {
        account_id: 'account',
        body: [
          { key: 'link:example.com/one', value: expect.any(String) },
          { key: 'link:example.com/two', value: expect.any(String) }
        ]
      })
      expect(
        JSON.parse(kvBulkUpdate.mock.calls[0][1].body[1].value)
      ).toMatchObject({
        id: 'b',
        paused: true,
        campaignIds: ['c1'],
        status: 302
      })
      // one D1 statement for the domain, one multi-row statement for the links
      expect(d1Query).toHaveBeenCalledTimes(2)
      expect(d1Query.mock.calls[1][1].params).toHaveLength(6)
      expect(prismaMock.shortLink.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['a', 'b'] } },
        data: { edgePublishedAt: publishedAt }
      })
    })
  })
})
