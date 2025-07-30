import { nanoid } from 'nanoid'
import { v4 as uuidv4 } from 'uuid'

import { Prisma, ShortLink, ShortLinkDomain } from '.prisma/api-media-client'
import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

jest.mock('nanoid')
jest.mock('uuid')

const nanoidMock = nanoid as jest.MockedFunction<typeof nanoid>
const uuidMock = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('shortLink', () => {
  const client = getClient()

  beforeEach(() => {
    prismaMock.userMediaRole.findUnique.mockResolvedValue({
      id: 'userId',
      userId: 'testUserId',
      roles: ['publisher']
    })
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

      it('should fetch a short link by path and hostname', async () => {
        const shortLink: ShortLink & { domain: ShortLinkDomain } = {
          id: 'testId',
          pathname: 'testPath',
          to: 'https://example.com',
          brightcoveId: null,
          redirectType: null,
          bitrate: null,
          service: 'apiJourneys',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'testUserId',
          domainId: 'domainId',
          domain: {
            id: 'domainId',
            hostname: 'example.com',
            apexName: 'example.com',
            createdAt: new Date(),
            updatedAt: new Date(),
            services: []
          }
        }
        prismaMock.shortLink.findFirstOrThrow.mockResolvedValue(shortLink)
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
        expect(prismaMock.shortLink.findFirstOrThrow).toHaveBeenCalledWith({
          include: { domain: true },
          where: { pathname: 'testPath', domain: { hostname: 'example.com' } }
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

      it('should fetch a short link by id', async () => {
        const shortLink: ShortLink & { domain: ShortLinkDomain } = {
          id: 'testId',
          pathname: 'testPath',
          to: 'https://example.com',
          brightcoveId: null,
          redirectType: null,
          bitrate: null,
          service: 'apiJourneys',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'testUserId',
          domainId: 'domainId',
          domain: {
            id: 'domainId',
            hostname: 'example.com',
            apexName: 'example.com',
            createdAt: new Date(),
            updatedAt: new Date(),
            services: []
          }
        }
        prismaMock.shortLink.findFirstOrThrow.mockResolvedValue(shortLink)
        const result = await client({
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
                service: 'apiJourneys'
              }
            }
          }
        })
        expect(prismaMock.shortLink.findFirstOrThrow).toHaveBeenCalledWith({
          include: { domain: true },
          where: { id: 'testId' }
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
        query ShortLinksQuery($hostname: String) {
          shortLinks(hostname: $hostname) {
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

      it('should fetch short links', async () => {
        const shortLink: ShortLink & { domain: ShortLinkDomain } = {
          id: 'testId',
          pathname: 'testPath',
          to: 'https://example.com',
          brightcoveId: null,
          redirectType: null,
          bitrate: null,
          service: 'apiJourneys',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'testUserId',
          domainId: 'domainId',
          domain: {
            id: 'domainId',
            hostname: 'example.com',
            apexName: 'example.com',
            createdAt: new Date(),
            updatedAt: new Date(),
            services: []
          }
        }
        prismaMock.shortLink.findMany.mockResolvedValue([shortLink])
        prismaMock.shortLink.count.mockResolvedValue(1)
        const result = await client({
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
        expect(prismaMock.shortLink.findMany).toHaveBeenCalled()
      })

      it('should fetch short links filtered by hostname', async () => {
        const shortLink: ShortLink & { domain: ShortLinkDomain } = {
          id: 'testId',
          pathname: 'testPath',
          to: 'https://example.com',
          brightcoveId: null,
          redirectType: null,
          bitrate: null,
          service: 'apiJourneys',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'testUserId',
          domainId: 'domainId',
          domain: {
            id: 'domainId',
            hostname: 'example.com',
            apexName: 'example.com',
            createdAt: new Date(),
            updatedAt: new Date(),
            services: []
          }
        }
        prismaMock.shortLink.findMany.mockResolvedValue([shortLink])
        prismaMock.shortLink.count.mockResolvedValue(10)
        const result = await client({
          document: SHORT_LINKS_QUERY,
          variables: { hostname: 'example.com' }
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
              totalCount: 10
            }
          }
        })
        expect(prismaMock.shortLink.findMany).toHaveBeenCalledWith({
          include: { domain: true },
          where: { domain: { hostname: 'example.com' } },
          orderBy: { domain: { hostname: 'asc' }, pathname: 'asc' },
          skip: 0,
          take: 21
        })
      })
    })
  })

  describe('mutations', () => {
    beforeEach(() => {
      prismaMock.userMediaRole.findUnique.mockResolvedValue({
        id: 'userId',
        userId: 'testUserId',
        roles: ['publisher']
      })
    })

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

      it('should create a short link', async () => {
        prismaMock.shortLinkDomain.findFirst.mockResolvedValue({
          id: 'domainId',
          hostname: 'example.com',
          apexName: 'example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          services: ['apiJourneys']
        })
        prismaMock.shortLinkBlocklistDomain.findFirst.mockResolvedValue(null)
        const shortLink: ShortLink & { domain: ShortLinkDomain } = {
          id: 'testId',
          pathname: 'testPath',
          to: 'https://example.com',
          brightcoveId: null,
          redirectType: null,
          bitrate: null,
          service: 'apiJourneys',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'testUserId',
          domainId: 'domainId',
          domain: {
            id: 'domainId',
            hostname: 'example.com',
            apexName: 'example.com',
            createdAt: new Date(),
            updatedAt: new Date(),
            services: []
          }
        }
        prismaMock.shortLink.create.mockResolvedValue(shortLink)
        const result = await client({
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
                service: 'apiJourneys'
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
      })

      it('should create a shortlink with a custom id', async () => {
        prismaMock.shortLinkDomain.findFirst.mockResolvedValue({
          id: 'domainId',
          hostname: 'example.com',
          apexName: 'example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          services: ['apiJourneys']
        })
        prismaMock.shortLinkBlocklistDomain.findFirst.mockResolvedValue(null)
        const shortLink: ShortLink & { domain: ShortLinkDomain } = {
          id: 'customId',
          pathname: 'testPath',
          to: 'https://example.com',
          brightcoveId: null,
          redirectType: null,
          bitrate: null,
          service: 'apiJourneys',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'testUserId',
          domainId: 'domainId',
          domain: {
            id: 'domainId',
            hostname: 'example.com',
            apexName: 'example.com',
            createdAt: new Date(),
            updatedAt: new Date(),
            services: []
          }
        }
        prismaMock.shortLink.create.mockResolvedValue(shortLink)
        await client({
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
      })

      it('should create a short link without a pathname', async () => {
        prismaMock.shortLinkDomain.findFirst.mockResolvedValue({
          id: 'domainId',
          hostname: 'example.com',
          apexName: 'example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          services: ['apiJourneys']
        })
        prismaMock.shortLinkBlocklistDomain.findFirst.mockResolvedValue(null)
        const generatedId = 'generatedId'
        nanoidMock.mockReturnValue(generatedId)
        const shortLink: ShortLink & { domain: ShortLinkDomain } = {
          id: 'testId',
          pathname: generatedId,
          to: 'https://example.com',
          brightcoveId: null,
          redirectType: null,
          bitrate: null,
          service: 'apiJourneys',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'testUserId',
          domainId: 'domainId',
          domain: {
            id: 'domainId',
            hostname: 'example.com',
            apexName: 'example.com',
            createdAt: new Date(),
            updatedAt: new Date(),
            services: []
          }
        }
        prismaMock.shortLink.create.mockResolvedValue(shortLink)
        const result = await client({
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
                service: 'apiJourneys'
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

      it('should return a NotUniqueError if the short link already exists', async () => {
        prismaMock.shortLinkDomain.findFirst.mockResolvedValue({
          id: 'domainId',
          hostname: 'example.com',
          apexName: 'example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          services: ['apiJourneys']
        })
        prismaMock.shortLinkBlocklistDomain.findFirst.mockResolvedValue(null)
        prismaMock.shortLink.create.mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
            code: 'P2002',
            clientVersion: 'prismaVersion'
          })
        )
        const result = await client({
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

      it('should return a ZodError if the to URL is invalid', async () => {
        prismaMock.shortLinkDomain.findFirst.mockResolvedValue({
          id: 'domainId',
          hostname: 'example.com',
          apexName: 'example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          services: ['apiJourneys']
        })
        const result = await client({
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
                    validation: 'url',
                    code: 'invalid_string',
                    message: 'Invalid url',
                    path: ['input', 'to']
                  }
                ],
                null,
                2
              ),
              fieldErrors: [
                {
                  message: 'Invalid url',
                  path: ['input', 'to']
                }
              ]
            }
          }
        })
      })

      it('should return a ZodError if the hostname is invalid', async () => {
        prismaMock.shortLinkDomain.findFirst.mockResolvedValue(null)
        const result = await client({
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
        prismaMock.shortLinkDomain.findFirst.mockResolvedValue({
          id: 'domainId',
          hostname: 'example.com',
          apexName: 'example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          services: ['apiJourneys']
        })
        prismaMock.shortLinkBlocklistDomain.findFirst.mockResolvedValue({
          hostname: 'example.com'
        })
        const result = await client({
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
                    message:
                      'to URL appears on blocklist (https://github.com/blocklistproject/Lists)',
                    path: ['input', 'to']
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

      it('should update a short link', async () => {
        const shortLink: ShortLink & { domain: ShortLinkDomain } = {
          id: 'testId',
          pathname: 'testPath',
          to: 'https://example.com',
          brightcoveId: null,
          redirectType: null,
          bitrate: null,
          service: 'apiJourneys',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'testUserId',
          domainId: 'domainId',
          domain: {
            id: 'domainId',
            hostname: 'example.com',
            apexName: 'example.com',
            createdAt: new Date(),
            updatedAt: new Date(),
            services: []
          }
        }
        prismaMock.shortLink.update.mockResolvedValue(shortLink)
        const result = await client({
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
        expect(prismaMock.shortLink.update).toHaveBeenCalledWith({
          include: { domain: true },
          where: { id: 'testId' },
          data: { to: 'https://example.com' }
        })
      })

      it('should return a NotFoundError if the short link does not exist', async () => {
        prismaMock.shortLink.update.mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError('No ShortLink found', {
            code: 'P2025',
            clientVersion: 'prismaVersion'
          })
        )
        const result = await client({
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
      })

      it('should return a ZodError if the to URL is invalid', async () => {
        const result = await client({
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
                    validation: 'url',
                    code: 'invalid_string',
                    message: 'Invalid url',
                    path: ['input', 'to']
                  }
                ],
                null,
                2
              ),
              fieldErrors: [
                {
                  message: 'Invalid url',
                  path: ['input', 'to']
                }
              ]
            }
          }
        })
      })

      it('should return a ZodError if the to URL is on the blocklist', async () => {
        prismaMock.shortLinkBlocklistDomain.findFirst.mockResolvedValue({
          hostname: 'example.com'
        })
        const result = await client({
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
                    message:
                      'to URL appears on blocklist (https://github.com/blocklistproject/Lists)',
                    path: ['input', 'to']
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

      it('should delete a short link', async () => {
        const shortLink: ShortLink & { domain: ShortLinkDomain } = {
          id: 'testId',
          pathname: 'testPath',
          to: 'https://example.com',
          brightcoveId: null,
          redirectType: null,
          bitrate: null,
          service: 'apiJourneys',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'testUserId',
          domainId: 'domainId',
          domain: {
            id: 'domainId',
            hostname: 'example.com',
            apexName: 'example.com',
            createdAt: new Date(),
            updatedAt: new Date(),
            services: []
          }
        }
        prismaMock.shortLink.delete.mockResolvedValue(shortLink)
        const result = await client({
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
        expect(prismaMock.shortLink.delete).toHaveBeenCalledWith({
          where: { id: 'testId' }
        })
      })

      it('should return a NotFoundError if the short link does not exist', async () => {
        prismaMock.shortLink.delete.mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError('No ShortLink found', {
            code: 'P2025',
            clientVersion: 'prismaVersion'
          })
        )
        const result = await client({
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
  })
})
