import { nanoid } from 'nanoid'
import { type MockedFunction, vi } from 'vitest'

import { MediaRole, Prisma } from '@core/prisma/media/client'
import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import {
  buildShortLink,
  buildShortLinkCampaign,
  buildShortLinkDestinationHistory,
  buildShortLinkDomain,
  buildShortLinkWithDomain,
  withRelations
} from '../../../test/shortLinkFixtures'

import { publishLink, unpublishLink } from './edge'

vi.mock('nanoid')
vi.mock('uuid')
vi.mock('./edge', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./edge')>()),
  publishLink: vi.fn(),
  unpublishLink: vi.fn()
}))

const nanoidMock = nanoid as MockedFunction<typeof nanoid>
const publishLinkMock = publishLink as MockedFunction<typeof publishLink>
const unpublishLinkMock = unpublishLink as MockedFunction<typeof unpublishLink>

const FORBIDDEN = {
  errors: [
    expect.objectContaining({
      extensions: expect.objectContaining({ code: 'FORBIDDEN' })
    })
  ]
}

describe('shortLink', () => {
  const client = getClient()
  const authClient = getClient({
    headers: {
      authorization: 'token'
    },
    context: {
      currentUser: {
        id: 'userId'
      }
    }
  })

  function setRoles(roles: MediaRole[]): void {
    prismaMock.userMediaRole.findUnique.mockResolvedValue({
      id: 'userId',
      userId: 'testUserId',
      roles,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setRoles(['publisher'])
    prismaMock.$transaction.mockImplementation(
      async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
        await callback(prismaMock)
    )
    publishLinkMock.mockResolvedValue(null)
    unpublishLinkMock.mockResolvedValue(undefined)
  })

  describe('queries', () => {
    describe('shortLinkByPath', () => {
      const SHORT_LINK_BY_PATH_QUERY = graphql(`
        query ShortLinkByPathQuery($pathname: String!, $hostname: String!) {
          shortLinkByPath(pathname: $pathname, hostname: $hostname) {
            ... on QueryShortLinkByPathSuccess {
              data {
                id
                pathname
                to
                domain {
                  hostname
                }
                service
              }
            }
            ... on NotFoundError {
              message
              location {
                path
                value
              }
            }
          }
        }
      `)

      it('should fetch a live short link by path and hostname', async () => {
        prismaMock.shortLink.findFirstOrThrow.mockResolvedValue(
          buildShortLinkWithDomain()
        )
        const result = await client({
          document: SHORT_LINK_BY_PATH_QUERY,
          variables: { pathname: 'testPath', hostname: 'example.com' }
        })
        expect(result).toEqual({
          data: {
            shortLinkByPath: {
              data: {
                id: 'testId',
                pathname: 'testPath',
                to: 'https://example.com',
                domain: { hostname: 'example.com' },
                service: 'apiJourneys'
              }
            }
          }
        })
        // deleted and retired links are ignored; paused links still resolve
        expect(prismaMock.shortLink.findFirstOrThrow).toHaveBeenCalledWith({
          include: { domain: true },
          where: {
            pathname: 'testPath',
            domain: { hostname: 'example.com' },
            deletedAt: null,
            status: { not: 'retired' }
          }
        })
      })

      it('should return a NotFoundError if the short link does not exist', async () => {
        prismaMock.shortLink.findFirstOrThrow.mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError('No ShortLink found', {
            code: 'P2025',
            clientVersion: 'prismaVersion'
          })
        )
        const result = await client({
          document: SHORT_LINK_BY_PATH_QUERY,
          variables: { pathname: 'testPath', hostname: 'example.com' }
        })
        expect(result).toEqual({
          data: {
            shortLinkByPath: {
              message: 'short link not found',
              location: [
                { path: ['pathname'], value: 'testPath' },
                { path: ['hostname'], value: 'example.com' }
              ]
            }
          }
        })
      })
    })

    describe('shortLink', () => {
      const SHORT_LINK_QUERY = graphql(`
        query ShortLinkQuery($id: String!) {
          shortLink(id: $id) {
            ... on QueryShortLinkSuccess {
              data {
                id
                pathname
                to
                domain {
                  hostname
                }
                service
                assetClass
                status
                tags
                shortUrl
                qrUrl
                campaigns {
                  id
                  name
                }
                destinationHistory {
                  id
                  from
                  to
                  changedBy
                  note
                }
              }
            }
            ... on NotFoundError {
              message
              location {
                path
                value
              }
            }
          }
        }
      `)

      it('should fetch a short link by id with the new fields', async () => {
        prismaMock.shortLink.findFirstOrThrow.mockResolvedValue(
          withRelations(
            buildShortLinkWithDomain({ assetClass: 'videoEmbedded' }),
            {
              campaigns: [buildShortLinkCampaign()],
              destinationHistory: [
                buildShortLinkDestinationHistory({ note: 'moved' })
              ]
            }
          )
        )
        const result = await authClient({
          document: SHORT_LINK_QUERY,
          variables: { id: 'testId' }
        })
        expect(result).toEqual({
          data: {
            shortLink: {
              data: {
                id: 'testId',
                pathname: 'testPath',
                to: 'https://example.com',
                domain: { hostname: 'example.com' },
                service: 'apiJourneys',
                assetClass: 'videoEmbedded',
                status: 'active',
                tags: [],
                shortUrl: 'https://example.com/testPath',
                qrUrl: 'https://example.com/testPath?qr=1',
                campaigns: [{ id: 'campaignId', name: 'Spring push' }],
                destinationHistory: [
                  {
                    id: 'historyId',
                    from: 'https://example.com',
                    to: 'https://example.com/new',
                    changedBy: 'testUserId',
                    note: 'moved'
                  }
                ]
              }
            }
          }
        })
        expect(prismaMock.shortLink.findFirstOrThrow).toHaveBeenCalledWith(
          expect.objectContaining({
            include: expect.objectContaining({
              domain: true,
              campaigns: { orderBy: { name: 'asc' } },
              destinationHistory: { orderBy: { changedAt: 'desc' } }
            }),
            where: { id: 'testId' }
          })
        )
      })

      it('should include the domain path prefix in shortUrl and qrUrl', async () => {
        prismaMock.shortLink.findFirstOrThrow.mockResolvedValue(
          withRelations(
            buildShortLinkWithDomain(
              { pathname: 'easter' },
              { hostname: 'jesus.film', pathPrefix: 's' }
            ),
            { campaigns: [], destinationHistory: [] }
          )
        )
        const result = await authClient({
          document: SHORT_LINK_QUERY,
          variables: { id: 'testId' }
        })
        expect(result).toMatchObject({
          data: {
            shortLink: {
              data: {
                pathname: 'easter',
                shortUrl: 'https://jesus.film/s/easter',
                qrUrl: 'https://jesus.film/s/easter?qr=1'
              }
            }
          }
        })
      })

      it('should allow a shortLinkEditor', async () => {
        setRoles(['shortLinkEditor'])
        prismaMock.shortLink.findFirstOrThrow.mockResolvedValue(
          withRelations(buildShortLinkWithDomain(), {
            campaigns: [],
            destinationHistory: []
          })
        )
        const result = await authClient({
          document: SHORT_LINK_QUERY,
          variables: { id: 'testId' }
        })
        expect(result).toMatchObject({
          data: { shortLink: { data: { id: 'testId' } } }
        })
      })

      it('should refuse a user without a short link role', async () => {
        setRoles([])
        const result = await authClient({
          document: SHORT_LINK_QUERY,
          variables: { id: 'testId' }
        })
        expect(result).toMatchObject({
          errors: [expect.objectContaining({ message: expect.any(String) })]
        })
        expect(prismaMock.shortLink.findFirstOrThrow).not.toHaveBeenCalled()
      })

      it('should return a NotFoundError if the short link does not exist', async () => {
        prismaMock.shortLink.findFirstOrThrow.mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError('No ShortLink found', {
            code: 'P2025',
            clientVersion: 'prismaVersion'
          })
        )
        const result = await authClient({
          document: SHORT_LINK_QUERY,
          variables: { id: 'testId' }
        })
        expect(result).toEqual({
          data: {
            shortLink: {
              message: 'short link not found',
              location: [{ path: ['id'], value: 'testId' }]
            }
          }
        })
      })
    })

    describe('shortLinks', () => {
      const SHORT_LINKS_QUERY = graphql(`
        query ShortLinksQuery($hostname: String, $filter: ShortLinksFilter) {
          shortLinks(hostname: $hostname, filter: $filter) {
            edges {
              node {
                id
                pathname
                to
                domain {
                  hostname
                }
                service
              }
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
            }
            totalCount
          }
        }
      `)

      it('should fetch short links, excluding deleted ones by default', async () => {
        prismaMock.shortLink.findMany.mockResolvedValue([
          buildShortLinkWithDomain()
        ])
        prismaMock.shortLink.count.mockResolvedValue(1)
        const result = await authClient({
          document: SHORT_LINKS_QUERY
        })
        expect(result).toEqual({
          data: {
            shortLinks: {
              edges: [
                {
                  node: {
                    id: 'testId',
                    pathname: 'testPath',
                    to: 'https://example.com',
                    domain: { hostname: 'example.com' },
                    service: 'apiJourneys'
                  }
                }
              ],
              pageInfo: {
                hasNextPage: false,
                hasPreviousPage: false,
                startCursor: 'R1BDOlM6dGVzdElk',
                endCursor: 'R1BDOlM6dGVzdElk'
              },
              totalCount: 1
            }
          }
        })
        expect(prismaMock.shortLink.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ where: { deletedAt: null } })
        )
      })

      it('should fetch short links filtered by hostname', async () => {
        prismaMock.shortLink.findMany.mockResolvedValue([
          buildShortLinkWithDomain()
        ])
        prismaMock.shortLink.count.mockResolvedValue(10)
        const result = await authClient({
          document: SHORT_LINKS_QUERY,
          variables: { hostname: 'example.com' }
        })
        expect(result).toMatchObject({
          data: { shortLinks: { totalCount: 10 } }
        })
        expect(prismaMock.shortLink.findMany).toHaveBeenCalledWith({
          include: { domain: true },
          where: { deletedAt: null, domain: { hostname: 'example.com' } },
          orderBy: { domain: { hostname: 'asc' }, pathname: 'asc' },
          skip: 0,
          take: 21
        })
      })

      it('should apply the filter input', async () => {
        prismaMock.shortLink.findMany.mockResolvedValue([])
        prismaMock.shortLink.count.mockResolvedValue(0)
        await authClient({
          document: SHORT_LINKS_QUERY,
          variables: {
            filter: {
              hostname: 'example.com',
              search: 'jesus',
              status: 'paused',
              assetClass: 'videoEmbedded',
              campaignId: 'c1',
              placement: 'inVideoQr',
              videoId: 'v1',
              youtubeVideoId: 'y1',
              tag: 'easter',
              service: 'youtube',
              includeDeleted: true
            }
          }
        })
        const contains = { contains: 'jesus', mode: 'insensitive' }
        expect(prismaMock.shortLink.count).toHaveBeenCalledWith({
          where: {
            domain: { hostname: 'example.com' },
            status: 'paused',
            assetClass: 'videoEmbedded',
            placement: 'inVideoQr',
            videoId: 'v1',
            youtubeVideoId: 'y1',
            service: 'youtube',
            tags: { has: 'easter' },
            campaigns: { some: { id: 'c1' } },
            OR: [
              { pathname: contains },
              { to: contains },
              { name: contains },
              { description: contains },
              { youtubeVideoId: contains }
            ]
          }
        })
      })
    })
  })

  describe('mutations', () => {
    describe('shortLinkCreate', () => {
      const SHORT_LINK_CREATE_MUTATION = graphql(`
        mutation ShortLinkCreateMutation(
          $input: MutationShortLinkCreateInput!
        ) {
          shortLinkCreate(input: $input) {
            ... on MutationShortLinkCreateSuccess {
              data {
                id
                pathname
                to
                domain {
                  hostname
                }
                service
                sourceRef
              }
            }
            ... on NotUniqueError {
              message
              location {
                path
                value
              }
            }
            ... on ZodError {
              message
              fieldErrors {
                message
                path
              }
            }
          }
        }
      `)

      beforeEach(() => {
        prismaMock.shortLinkDomain.findFirst.mockResolvedValue(
          buildShortLinkDomain({ services: ['apiJourneys'] })
        )
        prismaMock.shortLinkBlocklistDomain.findFirst.mockResolvedValue(null)
        prismaMock.shortLink.create.mockResolvedValue(
          buildShortLinkWithDomain()
        )
      })

      it('should create a short link and publish it inside the transaction', async () => {
        const result = await authClient({
          document: SHORT_LINK_CREATE_MUTATION,
          variables: {
            input: {
              pathname: 'testPath',
              to: 'https://example.com',
              hostname: 'example.com',
              service: 'apiJourneys'
            }
          }
        })
        expect(result).toEqual({
          data: {
            shortLinkCreate: {
              data: {
                id: 'testId',
                pathname: 'testPath',
                to: 'https://example.com',
                domain: { hostname: 'example.com' },
                service: 'apiJourneys',
                sourceRef: null
              }
            }
          }
        })
        expect(prismaMock.shortLink.create).toHaveBeenCalledWith({
          data: {
            pathname: 'testPath',
            to: 'https://example.com',
            domain: { connect: { hostname: 'example.com' } },
            service: 'apiJourneys',
            userId: 'testUserId'
          },
          include: { domain: true }
        })
        expect(prismaMock.$transaction).toHaveBeenCalledTimes(1)
        expect(publishLinkMock).toHaveBeenCalledTimes(1)
        expect(publishLinkMock.mock.calls[0][1]).toBe(prismaMock)
      })

      it('should create a short link for the youtube service with a sourceRef', async () => {
        prismaMock.shortLinkDomain.findFirst.mockResolvedValue(
          buildShortLinkDomain({
            hostname: 'nxstp.is',
            services: ['apiJourneys', 'youtube']
          })
        )
        prismaMock.shortLink.create.mockResolvedValue(
          buildShortLinkWithDomain(
            { sourceRef: 'youtube-channel:UC123', service: 'youtube' },
            { hostname: 'nxstp.is', services: ['apiJourneys', 'youtube'] }
          )
        )
        const result = await authClient({
          document: SHORT_LINK_CREATE_MUTATION,
          variables: {
            input: {
              pathname: 'testPath',
              to: 'https://example.com',
              hostname: 'nxstp.is',
              service: 'youtube',
              sourceRef: 'youtube-channel:UC123'
            }
          }
        })
        expect(result).toEqual({
          data: {
            shortLinkCreate: {
              data: {
                id: 'testId',
                pathname: 'testPath',
                to: 'https://example.com',
                domain: { hostname: 'nxstp.is' },
                service: 'youtube',
                sourceRef: 'youtube-channel:UC123'
              }
            }
          }
        })
        expect(prismaMock.shortLink.create).toHaveBeenCalledWith({
          data: {
            pathname: 'testPath',
            to: 'https://example.com',
            domain: { connect: { hostname: 'nxstp.is' } },
            service: 'youtube',
            sourceRef: 'youtube-channel:UC123',
            userId: 'testUserId'
          },
          include: { domain: true }
        })
      })

      it('should create a short link with the new attributes and campaigns', async () => {
        prismaMock.shortLinkCampaign.count.mockResolvedValue(2)
        await authClient({
          document: SHORT_LINK_CREATE_MUTATION,
          variables: {
            input: {
              pathname: 'testPath',
              to: 'https://example.com',
              hostname: 'example.com',
              service: 'apiJourneys',
              name: 'Launch',
              description: 'End screen QR',
              assetClass: 'videoEmbedded',
              status: 'paused',
              redirectStatus: 301,
              fallbackTo: 'https://fallback.example',
              placement: 'endScreen',
              language: 'en',
              tags: ['easter'],
              videoId: 'v1',
              youtubeVideoId: 'y1',
              campaignIds: ['c1', 'c2']
            }
          }
        })
        expect(prismaMock.shortLinkCampaign.count).toHaveBeenCalledWith({
          where: { id: { in: ['c1', 'c2'] } }
        })
        expect(prismaMock.shortLink.create).toHaveBeenCalledWith({
          data: {
            pathname: 'testPath',
            to: 'https://example.com',
            domain: { connect: { hostname: 'example.com' } },
            service: 'apiJourneys',
            userId: 'testUserId',
            name: 'Launch',
            description: 'End screen QR',
            assetClass: 'videoEmbedded',
            status: 'paused',
            redirectStatus: 301,
            fallbackTo: 'https://fallback.example',
            placement: 'endScreen',
            language: 'en',
            tags: ['easter'],
            video: { connect: { id: 'v1' } },
            youtubeVideoId: 'y1',
            campaigns: { connect: [{ id: 'c1' }, { id: 'c2' }] }
          },
          include: { domain: true }
        })
      })

      it('should return a ZodError when a campaign does not exist', async () => {
        prismaMock.shortLinkCampaign.count.mockResolvedValue(0)
        const result = await authClient({
          document: SHORT_LINK_CREATE_MUTATION,
          variables: {
            input: {
              pathname: 'testPath',
              to: 'https://example.com',
              hostname: 'example.com',
              service: 'apiJourneys',
              campaignIds: ['missing']
            }
          }
        })
        expect(result).toMatchObject({
          data: {
            shortLinkCreate: {
              fieldErrors: [
                {
                  message: 'one or more campaigns do not exist',
                  path: ['input', 'campaignIds']
                }
              ]
            }
          }
        })
        expect(prismaMock.shortLink.create).not.toHaveBeenCalled()
      })

      it('should return a ZodError for an invalid redirectStatus', async () => {
        const result = await authClient({
          document: SHORT_LINK_CREATE_MUTATION,
          variables: {
            input: {
              pathname: 'testPath',
              to: 'https://example.com',
              hostname: 'example.com',
              service: 'apiJourneys',
              redirectStatus: 200
            }
          }
        })
        expect(result).toMatchObject({
          data: {
            shortLinkCreate: {
              fieldErrors: [
                {
                  message: 'must be one of 301, 302, 307, 308',
                  path: ['input', 'redirectStatus']
                }
              ]
            }
          }
        })
      })

      it('should allow a shortLinkEditor to create a link', async () => {
        setRoles(['shortLinkEditor'])
        const result = await authClient({
          document: SHORT_LINK_CREATE_MUTATION,
          variables: {
            input: {
              pathname: 'testPath',
              to: 'https://example.com',
              hostname: 'example.com',
              service: 'apiJourneys'
            }
          }
        })
        expect(result).toMatchObject({
          data: { shortLinkCreate: { data: { id: 'testId' } } }
        })
      })

      it('should return a ZodError if the domain is not enabled for the youtube service', async () => {
        // the validate block matches on services hasEvery / isEmpty, so a domain
        // registered for apiJourneys alone must reject a youtube mint
        prismaMock.shortLinkDomain.findFirst.mockResolvedValue(null)
        const result = await authClient({
          document: SHORT_LINK_CREATE_MUTATION,
          variables: {
            input: {
              pathname: 'testPath',
              to: 'https://example.com',
              hostname: 'example.com',
              service: 'youtube',
              sourceRef: 'youtube-channel:UC123'
            }
          }
        })
        expect(result).toEqual({
          data: {
            shortLinkCreate: {
              message: expect.any(String),
              fieldErrors: [
                {
                  message:
                    'hostname not valid (short link domain may not exist or may not be setup for this service)',
                  path: ['input', 'hostname']
                }
              ]
            }
          }
        })
        expect(prismaMock.shortLinkDomain.findFirst).toHaveBeenCalledWith({
          where: {
            hostname: 'example.com',
            OR: [
              { services: { hasEvery: ['youtube'] } },
              { services: { isEmpty: true } }
            ]
          }
        })
        expect(prismaMock.shortLink.create).not.toHaveBeenCalled()
      })

      it('should create a shortlink with a custom id', async () => {
        prismaMock.shortLink.create.mockResolvedValue(
          buildShortLinkWithDomain({ id: 'customId' })
        )
        await authClient({
          document: SHORT_LINK_CREATE_MUTATION,
          variables: {
            input: {
              id: 'customId',
              pathname: 'testPath',
              to: 'https://example.com',
              hostname: 'example.com',
              service: 'apiJourneys'
            }
          }
        })
        expect(prismaMock.shortLink.create).toHaveBeenCalledWith({
          data: {
            id: 'customId',
            pathname: 'testPath',
            to: 'https://example.com',
            domain: { connect: { hostname: 'example.com' } },
            service: 'apiJourneys',
            userId: 'testUserId'
          },
          include: { domain: true }
        })
        expect(publishLinkMock).toHaveBeenCalledWith('customId', prismaMock)
      })

      it('should create a short link without a pathname', async () => {
        const generatedId = 'generatedId'
        nanoidMock.mockReturnValue(generatedId)
        prismaMock.shortLink.create.mockResolvedValue(
          buildShortLinkWithDomain({ pathname: generatedId })
        )
        const result = await authClient({
          document: SHORT_LINK_CREATE_MUTATION,
          variables: {
            input: {
              to: 'https://example.com',
              hostname: 'example.com',
              service: 'apiJourneys'
            }
          }
        })
        expect(result).toEqual({
          data: {
            shortLinkCreate: {
              data: {
                id: 'testId',
                pathname: generatedId,
                to: 'https://example.com',
                domain: { hostname: 'example.com' },
                service: 'apiJourneys',
                sourceRef: null
              }
            }
          }
        })
        expect(nanoid).toHaveBeenCalledWith(11)
        expect(prismaMock.shortLink.create).toHaveBeenCalledWith({
          data: {
            pathname: generatedId,
            to: 'https://example.com',
            domain: { connect: { hostname: 'example.com' } },
            service: 'apiJourneys',
            userId: 'testUserId'
          },
          include: { domain: true }
        })
      })

      it('should regenerate a pathname until it satisfies the domain grammar', async () => {
        prismaMock.shortLinkDomain.findFirst.mockResolvedValue(
          buildShortLinkDomain({
            services: ['apiJourneys'],
            slugAllowedChars: 'a-z0-9',
            slugCaseSensitive: false
          })
        )
        nanoidMock
          .mockReturnValueOnce('bad_value-1')
          .mockReturnValueOnce('GoodValue22')
        await authClient({
          document: SHORT_LINK_CREATE_MUTATION,
          variables: {
            input: {
              to: 'https://example.com',
              hostname: 'example.com',
              service: 'apiJourneys'
            }
          }
        })
        expect(nanoid).toHaveBeenCalledTimes(2)
        expect(prismaMock.shortLink.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ pathname: 'goodvalue22' })
          })
        )
      })

      it('should fail when no generated pathname satisfies the grammar', async () => {
        prismaMock.shortLinkDomain.findFirst.mockResolvedValue(
          buildShortLinkDomain({ services: ['apiJourneys'], slugMaxLength: 4 })
        )
        nanoidMock.mockReturnValue('elevenchars')
        const result = await authClient({
          document: SHORT_LINK_CREATE_MUTATION,
          variables: {
            input: {
              to: 'https://example.com',
              hostname: 'example.com',
              service: 'apiJourneys'
            }
          }
        })
        expect(nanoid).toHaveBeenCalledTimes(5)
        expect(result).toMatchObject({
          data: {
            shortLinkCreate: {
              fieldErrors: [
                {
                  message: expect.stringContaining(
                    'could not generate a pathname'
                  ),
                  path: ['input', 'pathname']
                }
              ]
            }
          }
        })
        expect(prismaMock.shortLink.create).not.toHaveBeenCalled()
      })

      it('should lower-case the pathname on a case-insensitive domain', async () => {
        prismaMock.shortLinkDomain.findFirst.mockResolvedValue(
          buildShortLinkDomain({
            services: ['apiJourneys'],
            slugCaseSensitive: false
          })
        )
        await authClient({
          document: SHORT_LINK_CREATE_MUTATION,
          variables: {
            input: {
              pathname: 'MixedCase',
              to: 'https://example.com',
              hostname: 'example.com',
              service: 'apiJourneys'
            }
          }
        })
        expect(prismaMock.shortLink.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ pathname: 'mixedcase' })
          })
        )
      })

      it.each([
        ['characters', 'bad.path', 'A-Za-z0-9_-', 1, 64, 'may only contain'],
        ['length', 'ab', 'A-Za-z0-9_-', 3, 32, 'at least 3'],
        ['length', 'a'.repeat(33), 'A-Za-z0-9_-', 3, 32, 'at most 32']
      ])(
        'should return a ZodError when the pathname violates the %s grammar',
        async (
          _rule,
          pathname,
          slugAllowedChars,
          slugMinLength,
          slugMaxLength,
          message
        ) => {
          prismaMock.shortLinkDomain.findFirst.mockResolvedValue(
            buildShortLinkDomain({
              services: ['apiJourneys'],
              slugAllowedChars,
              slugMinLength,
              slugMaxLength
            })
          )
          const result = await authClient({
            document: SHORT_LINK_CREATE_MUTATION,
            variables: {
              input: {
                pathname,
                to: 'https://example.com',
                hostname: 'example.com',
                service: 'apiJourneys'
              }
            }
          })
          expect(result).toMatchObject({
            data: {
              shortLinkCreate: {
                fieldErrors: [
                  {
                    message: expect.stringContaining(message),
                    path: ['input', 'pathname']
                  }
                ]
              }
            }
          })
          expect(prismaMock.shortLink.create).not.toHaveBeenCalled()
        }
      )

      it('should return a ZodError when the pathname is reserved', async () => {
        prismaMock.shortLinkDomain.findFirst.mockResolvedValue(
          buildShortLinkDomain({
            services: ['apiJourneys'],
            reservedPaths: ['admin', 'api']
          })
        )
        const result = await authClient({
          document: SHORT_LINK_CREATE_MUTATION,
          variables: {
            input: {
              pathname: 'Admin',
              to: 'https://example.com',
              hostname: 'example.com',
              service: 'apiJourneys'
            }
          }
        })
        expect(result).toMatchObject({
          data: {
            shortLinkCreate: {
              fieldErrors: [
                {
                  message: 'pathname is reserved on this domain',
                  path: ['input', 'pathname']
                }
              ]
            }
          }
        })
        expect(prismaMock.shortLink.create).not.toHaveBeenCalled()
      })

      it('should return a NotUniqueError if the short link already exists', async () => {
        prismaMock.shortLink.create.mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
            code: 'P2002',
            clientVersion: 'prismaVersion'
          })
        )
        const result = await authClient({
          document: SHORT_LINK_CREATE_MUTATION,
          variables: {
            input: {
              pathname: 'testPath',
              to: 'https://example.com',
              hostname: 'example.com',
              service: 'apiJourneys'
            }
          }
        })
        expect(result).toEqual({
          data: {
            shortLinkCreate: {
              message: 'short link already exists',
              location: [
                { path: ['input', 'hostname'], value: 'example.com' },
                { path: ['input', 'pathname'], value: 'testPath' }
              ]
            }
          }
        })
      })

      it('should fail the mutation when the edge publish fails', async () => {
        publishLinkMock.mockRejectedValue(new Error('kv down'))
        const result = await authClient({
          document: SHORT_LINK_CREATE_MUTATION,
          variables: {
            input: {
              pathname: 'testPath',
              to: 'https://example.com',
              hostname: 'example.com',
              service: 'apiJourneys'
            }
          }
        })
        expect(result).toMatchObject({
          errors: [expect.objectContaining({ message: 'kv down' })]
        })
      })

      it('should return a ZodError if the to URL is invalid', async () => {
        const result = await authClient({
          document: SHORT_LINK_CREATE_MUTATION,
          variables: {
            input: {
              pathname: 'testPath',
              to: 'invalid-url',
              hostname: 'example.com',
              service: 'apiJourneys'
            }
          }
        })
        expect(result).toEqual({
          data: {
            shortLinkCreate: {
              message: JSON.stringify(
                [
                  {
                    code: 'invalid_format',
                    format: 'url',
                    path: ['input', 'to'],
                    message: 'Invalid URL'
                  }
                ],
                null,
                2
              ),
              fieldErrors: [
                {
                  message: 'Invalid URL',
                  path: ['input', 'to']
                }
              ]
            }
          }
        })
      })

      it('should return a ZodError if the hostname is invalid', async () => {
        prismaMock.shortLinkDomain.findFirst.mockResolvedValue(null)
        const result = await authClient({
          document: SHORT_LINK_CREATE_MUTATION,
          variables: {
            input: {
              pathname: 'testPath',
              to: 'https://example.com',
              hostname: 'invalid-hostname',
              service: 'apiJourneys'
            }
          }
        })
        expect(result).toEqual({
          data: {
            shortLinkCreate: {
              message: JSON.stringify(
                [
                  {
                    code: 'custom',
                    path: ['input', 'hostname'],
                    message:
                      'hostname not valid (short link domain may not exist or may not be setup for this service)'
                  }
                ],
                null,
                2
              ),
              fieldErrors: [
                {
                  message:
                    'hostname not valid (short link domain may not exist or may not be setup for this service)',
                  path: ['input', 'hostname']
                }
              ]
            }
          }
        })
      })

      it('should return a ZodError if the to URL is on the blocklist', async () => {
        prismaMock.shortLinkBlocklistDomain.findFirst.mockResolvedValue({
          hostname: 'example.com',
          createdAt: new Date(),
          updatedAt: new Date()
        })
        const result = await authClient({
          document: SHORT_LINK_CREATE_MUTATION,
          variables: {
            input: {
              pathname: 'testPath',
              to: 'https://example.com',
              hostname: 'example.com',
              service: 'apiJourneys'
            }
          }
        })
        expect(result).toEqual({
          data: {
            shortLinkCreate: {
              message: JSON.stringify(
                [
                  {
                    code: 'custom',
                    path: ['input', 'to'],
                    message:
                      'to URL appears on blocklist (https://github.com/blocklistproject/Lists)'
                  }
                ],
                null,
                2
              ),
              fieldErrors: [
                {
                  message:
                    'to URL appears on blocklist (https://github.com/blocklistproject/Lists)',
                  path: ['input', 'to']
                }
              ]
            }
          }
        })
      })
    })

    describe('shortLinkUpdate', () => {
      const SHORT_LINK_UPDATE_MUTATION = graphql(`
        mutation ShortLinkUpdateMutation(
          $input: MutationShortLinkUpdateInput!
        ) {
          shortLinkUpdate(input: $input) {
            ... on MutationShortLinkUpdateSuccess {
              data {
                id
                pathname
                to
                domain {
                  hostname
                }
                service
              }
            }
            ... on NotFoundError {
              message
              location {
                path
                value
              }
            }
            ... on ZodError {
              message
              fieldErrors {
                message
                path
              }
            }
          }
        }
      `)

      beforeEach(() => {
        prismaMock.shortLink.findFirst.mockResolvedValue(buildShortLink())
        prismaMock.shortLink.update.mockResolvedValue(
          buildShortLinkWithDomain()
        )
        prismaMock.shortLinkBlocklistDomain.findFirst.mockResolvedValue(null)
      })

      it('should update a short link and publish it', async () => {
        const result = await authClient({
          document: SHORT_LINK_UPDATE_MUTATION,
          variables: {
            input: {
              id: 'testId',
              to: 'https://example.com'
            }
          }
        })
        expect(result).toEqual({
          data: {
            shortLinkUpdate: {
              data: {
                id: 'testId',
                pathname: 'testPath',
                to: 'https://example.com',
                domain: { hostname: 'example.com' },
                service: 'apiJourneys'
              }
            }
          }
        })
        expect(prismaMock.shortLink.findFirst).toHaveBeenCalledWith({
          where: { id: 'testId', deletedAt: null }
        })
        expect(prismaMock.shortLink.update).toHaveBeenCalledWith({
          include: { domain: true },
          where: { id: 'testId' },
          data: { to: 'https://example.com' }
        })
        expect(
          prismaMock.shortLinkDestinationHistory.create
        ).not.toHaveBeenCalled()
        expect(publishLinkMock).toHaveBeenCalledWith('testId', prismaMock)
      })

      it('should write a destination history row when `to` changes', async () => {
        await authClient({
          document: SHORT_LINK_UPDATE_MUTATION,
          variables: {
            input: {
              id: 'testId',
              to: 'https://example.com/new',
              note: 'campaign moved'
            }
          }
        })
        expect(
          prismaMock.shortLinkDestinationHistory.create
        ).toHaveBeenCalledWith({
          data: {
            shortLinkId: 'testId',
            from: 'https://example.com',
            to: 'https://example.com/new',
            changedBy: 'testUserId',
            note: 'campaign moved'
          }
        })
      })

      it('should update the new attributes and replace campaigns', async () => {
        prismaMock.shortLinkCampaign.count.mockResolvedValue(1)
        await authClient({
          document: SHORT_LINK_UPDATE_MUTATION,
          variables: {
            input: {
              id: 'testId',
              to: 'https://example.com',
              name: 'Renamed',
              status: 'paused',
              tags: ['a'],
              campaignIds: ['c1'],
              placement: 'card'
            }
          }
        })
        expect(prismaMock.shortLink.update).toHaveBeenCalledWith({
          include: { domain: true },
          where: { id: 'testId' },
          data: {
            to: 'https://example.com',
            name: 'Renamed',
            status: 'paused',
            tags: ['a'],
            placement: 'card',
            campaigns: { set: [{ id: 'c1' }] }
          }
        })
      })

      it('should not accept a pathname (pathnames are immutable)', async () => {
        const result = await authClient({
          document: SHORT_LINK_UPDATE_MUTATION,
          variables: {
            input: {
              id: 'testId',
              to: 'https://example.com',
              pathname: 'renamed'
            } as never
          }
        })
        expect(result).toMatchObject({
          errors: [
            expect.objectContaining({
              message: expect.stringContaining('pathname')
            })
          ]
        })
        expect(prismaMock.shortLink.update).not.toHaveBeenCalled()
      })

      describe('protection rules', () => {
        it('should refuse an editor changing the destination of a videoEmbedded link', async () => {
          setRoles(['shortLinkEditor'])
          prismaMock.shortLink.findFirst.mockResolvedValue(
            buildShortLink({ assetClass: 'videoEmbedded' })
          )
          const result = await authClient({
            document: SHORT_LINK_UPDATE_MUTATION,
            variables: {
              input: {
                id: 'testId',
                to: 'https://example.com/new',
                note: 'trying'
              }
            }
          })
          expect(result).toMatchObject(FORBIDDEN)
          expect(prismaMock.shortLink.update).not.toHaveBeenCalled()
          expect(publishLinkMock).not.toHaveBeenCalled()
        })

        it('should refuse an editor changing the destination of a permanent link', async () => {
          setRoles(['shortLinkEditor'])
          prismaMock.shortLink.findFirst.mockResolvedValue(
            buildShortLink({ assetClass: 'permanent' })
          )
          const result = await authClient({
            document: SHORT_LINK_UPDATE_MUTATION,
            variables: {
              input: { id: 'testId', to: 'https://example.com/new' }
            }
          })
          expect(result).toMatchObject(FORBIDDEN)
        })

        it('should let an editor update a videoEmbedded link without changing the destination', async () => {
          setRoles(['shortLinkEditor'])
          prismaMock.shortLink.findFirst.mockResolvedValue(
            buildShortLink({ assetClass: 'videoEmbedded' })
          )
          const result = await authClient({
            document: SHORT_LINK_UPDATE_MUTATION,
            variables: {
              input: { id: 'testId', to: 'https://example.com', name: 'x' }
            }
          })
          expect(result).toMatchObject({
            data: { shortLinkUpdate: { data: { id: 'testId' } } }
          })
        })

        it('should let an admin change a videoEmbedded destination with a note', async () => {
          setRoles(['shortLinkAdmin'])
          prismaMock.shortLink.findFirst.mockResolvedValue(
            buildShortLink({ assetClass: 'videoEmbedded' })
          )
          const result = await authClient({
            document: SHORT_LINK_UPDATE_MUTATION,
            variables: {
              input: {
                id: 'testId',
                to: 'https://example.com/new',
                note: 'video republished'
              }
            }
          })
          expect(result).toMatchObject({
            data: { shortLinkUpdate: { data: { id: 'testId' } } }
          })
          expect(
            prismaMock.shortLinkDestinationHistory.create
          ).toHaveBeenCalledWith({
            data: expect.objectContaining({
              from: 'https://example.com',
              to: 'https://example.com/new',
              note: 'video republished'
            })
          })
          expect(publishLinkMock).toHaveBeenCalledWith('testId', prismaMock)
        })

        it('should refuse an admin changing a videoEmbedded destination without a note', async () => {
          setRoles(['shortLinkAdmin'])
          prismaMock.shortLink.findFirst.mockResolvedValue(
            buildShortLink({ assetClass: 'videoEmbedded' })
          )
          const result = await authClient({
            document: SHORT_LINK_UPDATE_MUTATION,
            variables: {
              input: { id: 'testId', to: 'https://example.com/new', note: ' ' }
            }
          })
          expect(result).toMatchObject({
            data: {
              shortLinkUpdate: {
                fieldErrors: [
                  {
                    message: expect.stringContaining('note is required'),
                    path: ['input', 'note']
                  }
                ]
              }
            }
          })
          expect(prismaMock.shortLink.update).not.toHaveBeenCalled()
        })

        it('should refuse an editor downgrading a permanent link to standard', async () => {
          setRoles(['shortLinkEditor'])
          prismaMock.shortLink.findFirst.mockResolvedValue(
            buildShortLink({ assetClass: 'permanent' })
          )
          const result = await authClient({
            document: SHORT_LINK_UPDATE_MUTATION,
            variables: {
              input: {
                id: 'testId',
                to: 'https://example.com',
                assetClass: 'standard'
              }
            }
          })
          expect(result).toMatchObject(FORBIDDEN)
        })

        it('should let a publisher change a permanent destination', async () => {
          prismaMock.shortLink.findFirst.mockResolvedValue(
            buildShortLink({ assetClass: 'permanent' })
          )
          const result = await authClient({
            document: SHORT_LINK_UPDATE_MUTATION,
            variables: {
              input: { id: 'testId', to: 'https://example.com/new' }
            }
          })
          expect(result).toMatchObject({
            data: { shortLinkUpdate: { data: { id: 'testId' } } }
          })
        })
      })

      it('should return a NotFoundError if the short link does not exist', async () => {
        prismaMock.shortLink.findFirst.mockResolvedValue(null)
        const result = await authClient({
          document: SHORT_LINK_UPDATE_MUTATION,
          variables: {
            input: {
              id: 'testId',
              to: 'https://example.com'
            }
          }
        })
        expect(result).toEqual({
          data: {
            shortLinkUpdate: {
              message: 'short link not found',
              location: [{ path: ['input', 'id'], value: 'testId' }]
            }
          }
        })
        expect(prismaMock.shortLink.update).not.toHaveBeenCalled()
      })

      it('should return a ZodError if the to URL is invalid', async () => {
        const result = await authClient({
          document: SHORT_LINK_UPDATE_MUTATION,
          variables: {
            input: {
              id: 'testId',
              to: 'invalid-url'
            }
          }
        })
        expect(result).toEqual({
          data: {
            shortLinkUpdate: {
              message: JSON.stringify(
                [
                  {
                    code: 'invalid_format',
                    format: 'url',
                    path: ['input', 'to'],
                    message: 'Invalid URL'
                  }
                ],
                null,
                2
              ),
              fieldErrors: [
                {
                  message: 'Invalid URL',
                  path: ['input', 'to']
                }
              ]
            }
          }
        })
      })

      it('should return a ZodError if the to URL is on the blocklist', async () => {
        prismaMock.shortLinkBlocklistDomain.findFirst.mockResolvedValue({
          hostname: 'example.com',
          createdAt: new Date(),
          updatedAt: new Date()
        })
        const result = await authClient({
          document: SHORT_LINK_UPDATE_MUTATION,
          variables: {
            input: {
              id: 'testId',
              to: 'https://example.com'
            }
          }
        })
        expect(result).toEqual({
          data: {
            shortLinkUpdate: {
              message: JSON.stringify(
                [
                  {
                    code: 'custom',
                    path: ['input', 'to'],
                    message:
                      'to URL appears on blocklist (https://github.com/blocklistproject/Lists)'
                  }
                ],
                null,
                2
              ),
              fieldErrors: [
                {
                  message:
                    'to URL appears on blocklist (https://github.com/blocklistproject/Lists)',
                  path: ['input', 'to']
                }
              ]
            }
          }
        })
      })
    })

    describe('shortLinkDelete', () => {
      const SHORT_LINK_DELETE_MUTATION = graphql(`
        mutation ShortLinkDeleteMutation($id: String!) {
          shortLinkDelete(id: $id) {
            ... on MutationShortLinkDeleteSuccess {
              data {
                id
              }
            }
            ... on NotFoundError {
              message
              location {
                path
                value
              }
            }
          }
        }
      `)

      it('should soft delete a short link and unpublish it', async () => {
        prismaMock.shortLink.findFirst.mockResolvedValue(buildShortLink())
        prismaMock.shortLink.update.mockResolvedValue(
          buildShortLinkWithDomain({
            status: 'retired',
            deletedAt: new Date()
          })
        )
        const result = await authClient({
          document: SHORT_LINK_DELETE_MUTATION,
          variables: { id: 'testId' }
        })
        expect(result).toEqual({
          data: {
            shortLinkDelete: {
              data: {
                id: 'testId'
              }
            }
          }
        })
        expect(prismaMock.shortLink.delete).not.toHaveBeenCalled()
        expect(prismaMock.shortLink.update).toHaveBeenCalledWith({
          where: { id: 'testId' },
          data: { deletedAt: expect.any(Date), status: 'retired' }
        })
        expect(unpublishLinkMock).toHaveBeenCalledWith('testId', prismaMock)
      })

      it('should refuse an editor deleting a permanent link', async () => {
        setRoles(['shortLinkEditor'])
        prismaMock.shortLink.findFirst.mockResolvedValue(
          buildShortLink({ assetClass: 'permanent' })
        )
        const result = await authClient({
          document: SHORT_LINK_DELETE_MUTATION,
          variables: { id: 'testId' }
        })
        expect(result).toMatchObject(FORBIDDEN)
        expect(prismaMock.shortLink.update).not.toHaveBeenCalled()
        expect(unpublishLinkMock).not.toHaveBeenCalled()
      })

      it('should let an admin delete a videoEmbedded link', async () => {
        setRoles(['shortLinkAdmin'])
        prismaMock.shortLink.findFirst.mockResolvedValue(
          buildShortLink({ assetClass: 'videoEmbedded' })
        )
        prismaMock.shortLink.update.mockResolvedValue(
          buildShortLinkWithDomain()
        )
        const result = await authClient({
          document: SHORT_LINK_DELETE_MUTATION,
          variables: { id: 'testId' }
        })
        expect(result).toMatchObject({
          data: { shortLinkDelete: { data: { id: 'testId' } } }
        })
      })

      it('should return a NotFoundError if the short link does not exist', async () => {
        prismaMock.shortLink.findFirst.mockResolvedValue(null)
        const result = await authClient({
          document: SHORT_LINK_DELETE_MUTATION,
          variables: { id: 'testId' }
        })
        expect(result).toEqual({
          data: {
            shortLinkDelete: {
              message: 'short link not found',
              location: [{ path: ['id'], value: 'testId' }]
            }
          }
        })
      })
    })

    describe('shortLinkPublish', () => {
      const SHORT_LINK_PUBLISH_MUTATION = graphql(`
        mutation ShortLinkPublishMutation($id: String!) {
          shortLinkPublish(id: $id) {
            ... on MutationShortLinkPublishSuccess {
              data {
                id
                edgePublishedAt
              }
            }
            ... on NotFoundError {
              message
            }
          }
        }
      `)

      it('should republish a link for an admin', async () => {
        setRoles(['shortLinkAdmin'])
        prismaMock.shortLink.findUnique.mockResolvedValue(
          buildShortLinkWithDomain()
        )
        const publishedAt = new Date('2026-09-26T10:00:00.000Z')
        publishLinkMock.mockResolvedValue(publishedAt)
        const result = await authClient({
          document: SHORT_LINK_PUBLISH_MUTATION,
          variables: { id: 'testId' }
        })
        expect(result).toEqual({
          data: {
            shortLinkPublish: {
              data: { id: 'testId', edgePublishedAt: publishedAt.toISOString() }
            }
          }
        })
        expect(publishLinkMock).toHaveBeenCalledWith('testId')
      })

      it('should refuse an editor', async () => {
        setRoles(['shortLinkEditor'])
        const result = await authClient({
          document: SHORT_LINK_PUBLISH_MUTATION,
          variables: { id: 'testId' }
        })
        expect(result).toMatchObject({ errors: [expect.anything()] })
        expect(publishLinkMock).not.toHaveBeenCalled()
      })

      it('should return a NotFoundError when the link does not exist', async () => {
        prismaMock.shortLink.findUnique.mockResolvedValue(null)
        const result = await authClient({
          document: SHORT_LINK_PUBLISH_MUTATION,
          variables: { id: 'missing' }
        })
        expect(result).toEqual({
          data: { shortLinkPublish: { message: 'short link not found' } }
        })
      })
    })
  })
})
