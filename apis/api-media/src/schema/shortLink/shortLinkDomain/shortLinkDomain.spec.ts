import { type MockedFunction, vi } from 'vitest'

import { MediaRole, Prisma } from '@core/prisma/media/client'
import { graphql } from '@core/shared/gql'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import {
  buildShortLinkDomain,
  withRelations
} from '../../../../test/shortLinkFixtures'
import { usersPrismaMock } from '../../../../test/usersPrismaMock'
import { publishDomain, publishDomainWithLinks, unpublishDomain } from '../edge'

import {
  addVercelDomain,
  checkVercelDomain,
  removeVercelDomain
} from './shortLinkDomain.service'

vi.mock('node:dns/promises', () => ({
  resolve4: vi.fn().mockResolvedValue([]),
  resolveCname: vi.fn().mockResolvedValue([])
}))

vi.mock('./shortLinkDomain.service', () => ({
  checkVercelDomain: vi.fn(),
  addVercelDomain: vi.fn(),
  removeVercelDomain: vi.fn()
}))

vi.mock('../edge', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../edge')>()),
  publishLink: vi.fn(),
  unpublishLink: vi.fn(),
  publishDomain: vi.fn(),
  publishDomainWithLinks: vi.fn(),
  unpublishDomain: vi.fn()
}))

const mockCheckVercelDomain = checkVercelDomain as MockedFunction<
  typeof checkVercelDomain
>
const mockAddVercelDomain = addVercelDomain as MockedFunction<
  typeof addVercelDomain
>
const mockRemoveVercelDomain = removeVercelDomain as MockedFunction<
  typeof removeVercelDomain
>
const publishDomainMock = publishDomain as MockedFunction<typeof publishDomain>
const publishDomainWithLinksMock = publishDomainWithLinks as MockedFunction<
  typeof publishDomainWithLinks
>
const unpublishDomainMock = unpublishDomain as MockedFunction<
  typeof unpublishDomain
>

describe('shortLinkDomain', () => {
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
      userId: 'userId',
      roles,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  /** the caller's `superAdmin` flag in the users database */
  function setSuperAdmin(superAdmin: boolean): void {
    usersPrismaMock.user.findUnique.mockResolvedValue({
      superAdmin
    } as Awaited<ReturnType<typeof usersPrismaMock.user.findUnique>>)
  }

  beforeEach(() => {
    prismaMock.$transaction.mockImplementation(
      async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
        await callback(prismaMock)
    )
    setRoles(['publisher'])
    setSuperAdmin(true)
    publishDomainMock.mockResolvedValue(null)
    publishDomainWithLinksMock.mockResolvedValue(null)
    unpublishDomainMock.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('queries', () => {
    describe('shortLinkDomains', () => {
      const SHORT_LINK_DOMAINS_QUERY = graphql(`
        query ShortLinkDomainsQuery($service: Service) {
          shortLinkDomains(service: $service) {
            edges {
              node {
                id
                hostname
                createdAt
                updatedAt
                services
                check {
                  configured
                  verified
                  verification {
                    type
                    domain
                    value
                    reason
                  }
                }
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

      it('should fetch short link domains', async () => {
        prismaMock.shortLinkDomain.findMany.mockResolvedValue([
          buildShortLinkDomain({ id: 'testId', hostname: 'www.example.com' })
        ])
        prismaMock.shortLinkDomain.count.mockResolvedValue(1)
        mockCheckVercelDomain.mockResolvedValue({
          configured: true,
          verified: true,
          verification: []
        })
        const result = await authClient({
          document: SHORT_LINK_DOMAINS_QUERY
        })
        expect(result).toEqual({
          data: {
            shortLinkDomains: {
              edges: [
                {
                  node: {
                    id: 'testId',
                    hostname: 'www.example.com',
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    services: [],
                    check: {
                      configured: true,
                      verified: true,
                      verification: []
                    }
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
        expect(prismaMock.shortLinkDomain.findMany).toHaveBeenCalled()
        expect(prismaMock.shortLinkDomain.count).toHaveBeenCalled()
      })

      it('should fetch short link domains filtered by service', async () => {
        prismaMock.shortLinkDomain.findMany.mockResolvedValue([
          buildShortLinkDomain({
            id: 'testId',
            hostname: 'www.example.com',
            services: ['apiJourneys']
          })
        ])
        prismaMock.shortLinkDomain.count.mockResolvedValue(1)
        mockCheckVercelDomain.mockResolvedValue({
          configured: false,
          verified: false,
          verification: [
            {
              type: 'A',
              domain: 'example.com',
              value: 'value',
              reason: 'reason'
            }
          ]
        })
        const result = await authClient({
          document: SHORT_LINK_DOMAINS_QUERY,
          variables: { service: 'apiJourneys' }
        })
        expect(result).toEqual({
          data: {
            shortLinkDomains: {
              edges: [
                {
                  node: {
                    id: 'testId',
                    hostname: 'www.example.com',
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    services: ['apiJourneys'],
                    check: {
                      configured: false,
                      verified: false,
                      verification: [
                        {
                          type: 'A',
                          domain: 'example.com',
                          value: 'value',
                          reason: 'reason'
                        }
                      ]
                    }
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
        expect(prismaMock.shortLinkDomain.findMany).toHaveBeenCalledWith({
          where: {
            OR: [
              { services: { hasEvery: ['apiJourneys'] } },
              { services: { isEmpty: true } }
            ]
          },
          orderBy: { hostname: 'asc' },
          skip: 0,
          take: 21
        })
        expect(prismaMock.shortLinkDomain.count).toHaveBeenCalledWith({
          where: {
            OR: [
              { services: { hasEvery: ['apiJourneys'] } },
              { services: { isEmpty: true } }
            ]
          }
        })
      })
    })

    describe('shortLinkDomain', () => {
      const SHORT_LINK_DOMAIN_QUERY = graphql(`
        query ShortLinkDomainQuery($id: String!) {
          shortLinkDomain(id: $id) {
            ... on QueryShortLinkDomainSuccess {
              data {
                id
                hostname
                createdAt
                updatedAt
                services
                pathPrefix
                redirectStatus
                slugAllowedChars
                slugMinLength
                slugMaxLength
                slugCaseSensitive
                reservedPaths
                fallbackTo
                notFound
                passthroughOrigin
                autoFailover
                kvNamespaceId
                kvBinding
                edgePublishedAt
                linkCount
                check {
                  configured
                  verified
                  verification {
                    type
                    domain
                    value
                    reason
                  }
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

      it('should fetch a short link domain by id with the edge settings', async () => {
        prismaMock.shortLinkDomain.findFirstOrThrow.mockResolvedValue(
          withRelations(
            buildShortLinkDomain({
              id: 'testId',
              hostname: 'arc.gt',
              pathPrefix: 'go',
              redirectStatus: 302,
              reservedPaths: ['s', 'hls'],
              notFound: 'passthrough',
              passthroughOrigin: 'https://api.arclight.org',
              kvNamespaceId: 'ns-1',
              kvBinding: 'KV_ARC_GT'
            }),
            {
              _count: { shortLinks: 3 }
            }
          )
        )
        mockCheckVercelDomain.mockResolvedValue({
          configured: true,
          verified: true,
          verification: []
        })
        const result = await authClient({
          document: SHORT_LINK_DOMAIN_QUERY,
          variables: { id: 'testId' }
        })
        expect(result).toEqual({
          data: {
            shortLinkDomain: {
              data: {
                id: 'testId',
                hostname: 'arc.gt',
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
                services: [],
                pathPrefix: 'go',
                redirectStatus: 302,
                slugAllowedChars: 'A-Za-z0-9_-',
                slugMinLength: 1,
                slugMaxLength: 64,
                slugCaseSensitive: true,
                reservedPaths: ['s', 'hls'],
                fallbackTo: null,
                notFound: 'passthrough',
                passthroughOrigin: 'https://api.arclight.org',
                autoFailover: false,
                kvNamespaceId: 'ns-1',
                kvBinding: 'KV_ARC_GT',
                edgePublishedAt: null,
                linkCount: 3,
                check: {
                  configured: true,
                  verified: true,
                  verification: []
                }
              }
            }
          }
        })
        expect(
          prismaMock.shortLinkDomain.findFirstOrThrow
        ).toHaveBeenCalledWith({
          where: { id: 'testId' },
          include: {
            _count: { select: { shortLinks: { where: { deletedAt: null } } } }
          }
        })
        expect(mockCheckVercelDomain).toHaveBeenCalledWith('arc.gt')
      })

      it('should return a NotFoundError if the short link domain does not exist', async () => {
        prismaMock.shortLinkDomain.findFirstOrThrow.mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError('No ShortLinkDomain found', {
            code: 'P2025',
            clientVersion: 'prismaVersion'
          })
        )
        const result = await authClient({
          document: SHORT_LINK_DOMAIN_QUERY,
          variables: { id: 'testId' }
        })
        expect(result).toEqual({
          data: {
            shortLinkDomain: {
              message: 'short link domain not found',
              location: [
                {
                  path: ['id'],
                  value: 'testId'
                }
              ]
            }
          }
        })
      })
    })
  })

  describe('shortLinkDomainByHostname', () => {
    const SHORT_LINK_DOMAIN_BY_HOSTNAME_QUERY = graphql(`
      query ShortLinkDomainByHostnameQuery($hostname: String!) {
        shortLinkDomainByHostname(hostname: $hostname) {
          __typename
          ... on QueryShortLinkDomainByHostnameSuccess {
            data {
              id
              hostname
              redirectStatus
              fallbackTo
              notFound
              passthroughOrigin
              reservedPaths
              slugCaseSensitive
              pathPrefix
              kvBinding
            }
          }
          ... on NotFoundError {
            message
          }
        }
      }
    `)

    // the redirect Worker calls this with no credentials
    const publicClient = getClient()

    it('returns the routing settings of a domain without authentication', async () => {
      prismaMock.shortLinkDomain.findUnique.mockResolvedValue(
        buildShortLinkDomain({
          id: 'domainId',
          hostname: 'jesus.film',
          pathPrefix: 's',
          redirectStatus: 302,
          reservedPaths: ['dashboard'],
          slugCaseSensitive: false,
          kvBinding: 'KV_JESUS_FILM'
        })
      )

      const result = await publicClient({
        document: SHORT_LINK_DOMAIN_BY_HOSTNAME_QUERY,
        variables: { hostname: 'Jesus.Film' }
      })

      expect(result).toEqual({
        data: {
          shortLinkDomainByHostname: {
            __typename: 'QueryShortLinkDomainByHostnameSuccess',
            data: {
              id: 'domainId',
              hostname: 'jesus.film',
              redirectStatus: 302,
              fallbackTo: null,
              notFound: 'lostPage',
              passthroughOrigin: null,
              reservedPaths: ['dashboard'],
              slugCaseSensitive: false,
              pathPrefix: 's',
              kvBinding: 'KV_JESUS_FILM'
            }
          }
        }
      })
      expect(prismaMock.shortLinkDomain.findUnique).toHaveBeenCalledWith({
        where: { hostname: 'jesus.film' }
      })
    })

    it('returns a NotFoundError for an unknown hostname', async () => {
      prismaMock.shortLinkDomain.findUnique.mockResolvedValue(null)

      const result = await publicClient({
        document: SHORT_LINK_DOMAIN_BY_HOSTNAME_QUERY,
        variables: { hostname: 'unknown.example' }
      })

      expect(result).toEqual({
        data: {
          shortLinkDomainByHostname: {
            __typename: 'NotFoundError',
            message: 'short link domain not found'
          }
        }
      })
    })
  })

  describe('mutations', () => {
    describe('shortLinkDomainCreate', () => {
      const SHORT_LINK_DOMAIN_CREATE_MUTATION = graphql(`
        mutation ShortLinkDomainCreateMutation(
          $input: MutationShortLinkDomainCreateInput!
        ) {
          shortLinkDomainCreate(input: $input) {
            ... on MutationShortLinkDomainCreateSuccess {
              data {
                id
                hostname
                createdAt
                updatedAt
                services
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
        mockAddVercelDomain.mockResolvedValue({
          name: 'www.example.com',
          apexName: 'example.com',
          verified: false
        })
      })

      it('should create a short link domain and publish its record', async () => {
        prismaMock.shortLinkDomain.create.mockResolvedValue(
          buildShortLinkDomain({
            id: 'testId',
            hostname: 'www.example.com',
            services: ['apiJourneys']
          })
        )
        const result = await authClient({
          document: SHORT_LINK_DOMAIN_CREATE_MUTATION,
          variables: {
            input: {
              hostname: 'example.com',
              services: ['apiJourneys']
            }
          }
        })
        expect(result).toEqual({
          data: {
            shortLinkDomainCreate: {
              data: {
                id: 'testId',
                hostname: 'www.example.com',
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
                services: ['apiJourneys']
              }
            }
          }
        })
        expect(prismaMock.shortLinkDomain.create).toHaveBeenCalledWith({
          data: {
            hostname: 'example.com',
            apexName: 'example.com',
            services: ['apiJourneys']
          }
        })
        expect(mockAddVercelDomain).toHaveBeenCalledWith('example.com')
        expect(publishDomainMock).toHaveBeenCalledWith('testId', prismaMock)
      })

      it('should create a short link domain with edge settings', async () => {
        prismaMock.shortLinkDomain.create.mockResolvedValue(
          buildShortLinkDomain({ id: 'testId', hostname: 'arc.gt' })
        )
        await authClient({
          document: SHORT_LINK_DOMAIN_CREATE_MUTATION,
          variables: {
            input: {
              hostname: 'arc.gt',
              redirectStatus: 302,
              slugAllowedChars: 'a-z0-9-',
              slugMinLength: 3,
              slugMaxLength: 32,
              slugCaseSensitive: false,
              reservedPaths: ['s', 'hls'],
              fallbackTo: 'https://www.jesusfilm.org',
              notFound: 'passthrough',
              passthroughOrigin: 'https://api.arclight.org',
              autoFailover: true
            }
          }
        })
        expect(prismaMock.shortLinkDomain.create).toHaveBeenCalledWith({
          data: {
            hostname: 'arc.gt',
            apexName: 'example.com',
            services: [],
            redirectStatus: 302,
            slugAllowedChars: 'a-z0-9-',
            slugMinLength: 3,
            slugMaxLength: 32,
            slugCaseSensitive: false,
            reservedPaths: ['s', 'hls'],
            fallbackTo: 'https://www.jesusfilm.org',
            notFound: 'passthrough',
            passthroughOrigin: 'https://api.arclight.org',
            autoFailover: true
          }
        })
      })

      it('should normalise the path prefix', async () => {
        prismaMock.shortLinkDomain.create.mockResolvedValue(
          buildShortLinkDomain({
            id: 'testId',
            hostname: 'jesus.film',
            pathPrefix: 's'
          })
        )
        await authClient({
          document: SHORT_LINK_DOMAIN_CREATE_MUTATION,
          variables: { input: { hostname: 'jesus.film', pathPrefix: '/s/' } }
        })
        expect(prismaMock.shortLinkDomain.create).toHaveBeenCalledWith({
          data: {
            hostname: 'jesus.film',
            apexName: 'example.com',
            services: [],
            pathPrefix: 's'
          }
        })
        expect(publishDomainMock).toHaveBeenCalledWith('testId', prismaMock)
      })

      it.each(['a b', 's//x', 's.x', 's?x=1'])(
        'should return a ZodError for the invalid path prefix %j',
        async (pathPrefix) => {
          const result = await authClient({
            document: SHORT_LINK_DOMAIN_CREATE_MUTATION,
            variables: { input: { hostname: 'jesus.film', pathPrefix } }
          })
          expect(result).toMatchObject({
            data: {
              shortLinkDomainCreate: {
                fieldErrors: [
                  {
                    message: expect.stringContaining('pathPrefix must be'),
                    path: ['input', 'pathPrefix']
                  }
                ]
              }
            }
          })
          expect(prismaMock.shortLinkDomain.create).not.toHaveBeenCalled()
        }
      )

      it('should create a short link domain with its KV namespace and binding', async () => {
        prismaMock.shortLinkDomain.create.mockResolvedValue(
          buildShortLinkDomain({
            id: 'testId',
            hostname: 'jesus.film',
            kvNamespaceId: 'ns-1',
            kvBinding: 'KV_JESUS_FILM'
          })
        )
        await authClient({
          document: SHORT_LINK_DOMAIN_CREATE_MUTATION,
          variables: {
            input: {
              hostname: 'jesus.film',
              kvNamespaceId: ' ns-1 ',
              kvBinding: 'KV_JESUS_FILM'
            }
          }
        })
        expect(prismaMock.shortLinkDomain.create).toHaveBeenCalledWith({
          data: {
            hostname: 'jesus.film',
            apexName: 'example.com',
            services: [],
            kvNamespaceId: 'ns-1',
            kvBinding: 'KV_JESUS_FILM'
          }
        })
        expect(publishDomainMock).toHaveBeenCalledWith('testId', prismaMock)
      })

      it('should return a ZodError for an invalid binding on create', async () => {
        const result = await authClient({
          document: SHORT_LINK_DOMAIN_CREATE_MUTATION,
          variables: { input: { hostname: 'jesus.film', kvBinding: 'kv_bad' } }
        })
        expect(result).toMatchObject({
          data: {
            shortLinkDomainCreate: {
              fieldErrors: [
                {
                  message: expect.stringContaining('kvBinding must be'),
                  path: ['input', 'kvBinding']
                }
              ]
            }
          }
        })
        expect(prismaMock.shortLinkDomain.create).not.toHaveBeenCalled()
      })

      it('should allow a superAdmin with no media role', async () => {
        setRoles([])
        prismaMock.shortLinkDomain.create.mockResolvedValue(
          buildShortLinkDomain({ id: 'testId' })
        )
        const result = await authClient({
          document: SHORT_LINK_DOMAIN_CREATE_MUTATION,
          variables: { input: { hostname: 'example.com' } }
        })
        expect(result).toMatchObject({
          data: { shortLinkDomainCreate: { data: { id: 'testId' } } }
        })
        expect(usersPrismaMock.user.findUnique).toHaveBeenCalledWith({
          where: { userId: 'testUserId' },
          select: { superAdmin: true }
        })
      })

      it.each<MediaRole>(['publisher', 'shortLinkAdmin', 'shortLinkEditor'])(
        'should refuse a %s who is not a superAdmin',
        async (role) => {
          setRoles([role])
          setSuperAdmin(false)
          const result = await authClient({
            document: SHORT_LINK_DOMAIN_CREATE_MUTATION,
            variables: { input: { hostname: 'example.com' } }
          })
          expect(result).toMatchObject({ errors: [expect.anything()] })
          expect(prismaMock.shortLinkDomain.create).not.toHaveBeenCalled()
        }
      )

      it('should not register a Worker-served domain on Vercel', async () => {
        prismaMock.shortLinkDomain.create.mockResolvedValue(
          buildShortLinkDomain({ id: 'testId', hostname: 'jesus.movie' })
        )
        await authClient({
          document: SHORT_LINK_DOMAIN_CREATE_MUTATION,
          variables: {
            input: { hostname: 'jesus.movie', pathPrefix: 's', vercel: false }
          }
        })
        expect(mockAddVercelDomain).not.toHaveBeenCalled()
        expect(prismaMock.shortLinkDomain.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            hostname: 'jesus.movie',
            apexName: 'jesus.movie',
            pathPrefix: 's'
          })
        })
      })

      it('should not deregister a domain it never registered on Vercel', async () => {
        prismaMock.shortLinkDomain.create.mockResolvedValue(
          buildShortLinkDomain({ id: 'testId' })
        )
        publishDomainMock.mockRejectedValue(new Error('kv down'))
        await authClient({
          document: SHORT_LINK_DOMAIN_CREATE_MUTATION,
          variables: { input: { hostname: 'example.com', vercel: false } }
        })
        expect(mockRemoveVercelDomain).not.toHaveBeenCalled()
      })

      it.each([
        [
          { redirectStatus: 200 },
          'redirectStatus',
          'must be one of 301, 302, 307, 308'
        ],
        [
          { fallbackTo: 'http://insecure.example' },
          'fallbackTo',
          'must be an https URL'
        ],
        [
          { passthroughOrigin: 'not a url' },
          'passthroughOrigin',
          'must be an https URL'
        ],
        [
          { slugAllowedChars: 'z-a' },
          'slugAllowedChars',
          expect.stringContaining('character-class')
        ],
        [{ slugMaxLength: 65 }, 'slugMaxLength', expect.any(String)]
      ])(
        'should return a ZodError for invalid settings %j',
        async (settings, field, message) => {
          const result = await authClient({
            document: SHORT_LINK_DOMAIN_CREATE_MUTATION,
            variables: { input: { hostname: 'example.com', ...settings } }
          })
          expect(result).toMatchObject({
            data: {
              shortLinkDomainCreate: {
                fieldErrors: [{ message, path: ['input', field] }]
              }
            }
          })
          expect(prismaMock.shortLinkDomain.create).not.toHaveBeenCalled()
        }
      )

      it('should require passthroughOrigin when notFound is passthrough', async () => {
        const result = await authClient({
          document: SHORT_LINK_DOMAIN_CREATE_MUTATION,
          variables: {
            input: { hostname: 'example.com', notFound: 'passthrough' }
          }
        })
        expect(result).toMatchObject({
          data: {
            shortLinkDomainCreate: {
              fieldErrors: [
                {
                  message:
                    'passthroughOrigin is required when notFound is passthrough',
                  path: ['input', 'passthroughOrigin']
                }
              ]
            }
          }
        })
        expect(prismaMock.shortLinkDomain.create).not.toHaveBeenCalled()
      })

      it('should create a short link domain with no services provided', async () => {
        prismaMock.shortLinkDomain.create.mockResolvedValue(
          buildShortLinkDomain({ id: 'testId', hostname: 'www.example.com' })
        )
        const result = await authClient({
          document: SHORT_LINK_DOMAIN_CREATE_MUTATION,
          variables: {
            input: {
              hostname: 'www.example.com'
            }
          }
        })
        expect(result).toEqual({
          data: {
            shortLinkDomainCreate: {
              data: {
                id: 'testId',
                hostname: 'www.example.com',
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
                services: []
              }
            }
          }
        })
        expect(prismaMock.shortLinkDomain.create).toHaveBeenCalledWith({
          data: {
            apexName: 'example.com',
            hostname: 'www.example.com',
            services: []
          }
        })
        expect(mockAddVercelDomain).toHaveBeenCalledWith('www.example.com')
      })

      it('should return a NotUniqueError if the short link domain already exists', async () => {
        prismaMock.shortLinkDomain.create.mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
            code: 'P2002',
            clientVersion: 'prismaVersion'
          })
        )
        const result = await authClient({
          document: SHORT_LINK_DOMAIN_CREATE_MUTATION,
          variables: {
            input: {
              hostname: 'www.example.com',
              services: ['apiJourneys']
            }
          }
        })
        expect(result).toEqual({
          data: {
            shortLinkDomainCreate: {
              message: 'short link domain already exists',
              location: [
                { path: ['input', 'hostname'], value: 'www.example.com' }
              ]
            }
          }
        })
        expect(mockAddVercelDomain).toHaveBeenCalledWith('www.example.com')
        expect(publishDomainMock).not.toHaveBeenCalled()
      })

      it('should return a validation error if the hostname is invalid', async () => {
        const result = await authClient({
          document: SHORT_LINK_DOMAIN_CREATE_MUTATION,
          variables: {
            input: {
              hostname: 'hostname invalid',
              services: ['apiJourneys']
            }
          }
        })
        expect(result).toEqual({
          data: {
            shortLinkDomainCreate: {
              message: JSON.stringify(
                [
                  {
                    code: 'custom',
                    path: ['input', 'hostname'],
                    message: 'hostname must be valid'
                  }
                ],
                null,
                2
              ),
              fieldErrors: [
                {
                  message: 'hostname must be valid',
                  path: ['input', 'hostname']
                }
              ]
            }
          }
        })
      })

      it('should call removeVercelDomain if an error occurs during creation', async () => {
        prismaMock.shortLinkDomain.create.mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError('Some error', {
            code: 'P2003',
            clientVersion: 'prismaVersion'
          })
        )
        await authClient({
          document: SHORT_LINK_DOMAIN_CREATE_MUTATION,
          variables: {
            input: {
              hostname: 'www.example.com',
              services: ['apiJourneys']
            }
          }
        })
        expect(mockAddVercelDomain).toHaveBeenCalledWith('www.example.com')
        expect(mockRemoveVercelDomain).toHaveBeenCalledWith('www.example.com')
      })

      it('should roll the domain back when the edge publish fails', async () => {
        prismaMock.shortLinkDomain.create.mockResolvedValue(
          buildShortLinkDomain({ id: 'testId' })
        )
        publishDomainMock.mockRejectedValue(new Error('kv down'))
        const result = await authClient({
          document: SHORT_LINK_DOMAIN_CREATE_MUTATION,
          variables: { input: { hostname: 'example.com' } }
        })
        expect(result).toMatchObject({
          errors: [expect.objectContaining({ message: 'kv down' })]
        })
        expect(mockRemoveVercelDomain).toHaveBeenCalledWith('example.com')
      })
    })

    describe('shortLinkDomainUpdate', () => {
      const SHORT_LINK_DOMAIN_UPDATE_MUTATION = graphql(`
        mutation ShortLinkDomainUpdateMutation(
          $input: MutationShortLinkDomainUpdateInput!
        ) {
          shortLinkDomainUpdate(input: $input) {
            ... on MutationShortLinkDomainUpdateSuccess {
              data {
                id
                hostname
                createdAt
                updatedAt
                services
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

      it('should update a short link domain and republish only its record', async () => {
        prismaMock.shortLinkDomain.findUnique.mockResolvedValue(
          buildShortLinkDomain({ id: 'testId', hostname: 'www.example.com' })
        )
        prismaMock.shortLinkDomain.update.mockResolvedValue(
          buildShortLinkDomain({
            id: 'testId',
            hostname: 'www.example.com',
            services: ['apiJourneys']
          })
        )
        const result = await authClient({
          document: SHORT_LINK_DOMAIN_UPDATE_MUTATION,
          variables: {
            input: {
              id: 'testId',
              services: ['apiJourneys']
            }
          }
        })
        expect(result).toEqual({
          data: {
            shortLinkDomainUpdate: {
              data: {
                id: 'testId',
                hostname: 'www.example.com',
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
                services: ['apiJourneys']
              }
            }
          }
        })
        expect(prismaMock.shortLinkDomain.update).toHaveBeenCalledWith({
          where: { id: 'testId' },
          data: {
            services: ['apiJourneys']
          }
        })
        expect(publishDomainMock).toHaveBeenCalledWith('testId', prismaMock)
        expect(publishDomainWithLinksMock).not.toHaveBeenCalled()
      })

      it('should normalise a changed path prefix and republish the domain record only', async () => {
        prismaMock.shortLinkDomain.findUnique.mockResolvedValue(
          buildShortLinkDomain({ id: 'testId', hostname: 'jesus.film' })
        )
        prismaMock.shortLinkDomain.update.mockResolvedValue(
          buildShortLinkDomain({
            id: 'testId',
            hostname: 'jesus.film',
            pathPrefix: 's'
          })
        )
        await authClient({
          document: SHORT_LINK_DOMAIN_UPDATE_MUTATION,
          variables: {
            input: { id: 'testId', services: [], pathPrefix: '/s/' }
          }
        })
        expect(prismaMock.shortLinkDomain.update).toHaveBeenCalledWith({
          where: { id: 'testId' },
          data: { services: [], pathPrefix: 's' }
        })
        expect(publishDomainMock).toHaveBeenCalledWith('testId', prismaMock)
        expect(publishDomainWithLinksMock).not.toHaveBeenCalled()
      })

      it('should clear the path prefix with an empty string', async () => {
        prismaMock.shortLinkDomain.findUnique.mockResolvedValue(
          buildShortLinkDomain({ id: 'testId', pathPrefix: 's' })
        )
        prismaMock.shortLinkDomain.update.mockResolvedValue(
          buildShortLinkDomain({ id: 'testId', pathPrefix: '' })
        )
        await authClient({
          document: SHORT_LINK_DOMAIN_UPDATE_MUTATION,
          variables: { input: { id: 'testId', services: [], pathPrefix: '/' } }
        })
        expect(prismaMock.shortLinkDomain.update).toHaveBeenCalledWith({
          where: { id: 'testId' },
          data: { services: [], pathPrefix: '' }
        })
        expect(publishDomainMock).toHaveBeenCalledWith('testId', prismaMock)
      })

      it('should return a ZodError for an invalid path prefix', async () => {
        prismaMock.shortLinkDomain.findUnique.mockResolvedValue(
          buildShortLinkDomain({ id: 'testId' })
        )
        const result = await authClient({
          document: SHORT_LINK_DOMAIN_UPDATE_MUTATION,
          variables: {
            input: { id: 'testId', services: [], pathPrefix: 'bad prefix' }
          }
        })
        expect(result).toMatchObject({
          data: {
            shortLinkDomainUpdate: {
              fieldErrors: [
                {
                  message: expect.stringContaining('pathPrefix must be'),
                  path: ['input', 'pathPrefix']
                }
              ]
            }
          }
        })
        expect(prismaMock.shortLinkDomain.update).not.toHaveBeenCalled()
        expect(publishDomainMock).not.toHaveBeenCalled()
      })

      it('should republish only the domain record when the redirect status changes', async () => {
        // routing records no longer carry the domain default status
        prismaMock.shortLinkDomain.findUnique.mockResolvedValue(
          buildShortLinkDomain({ id: 'testId', redirectStatus: 307 })
        )
        prismaMock.shortLinkDomain.update.mockResolvedValue(
          buildShortLinkDomain({ id: 'testId', redirectStatus: 301 })
        )
        await authClient({
          document: SHORT_LINK_DOMAIN_UPDATE_MUTATION,
          variables: {
            input: { id: 'testId', services: [], redirectStatus: 301 }
          }
        })
        expect(prismaMock.shortLinkDomain.update).toHaveBeenCalledWith({
          where: { id: 'testId' },
          data: { services: [], redirectStatus: 301 }
        })
        expect(publishDomainMock).toHaveBeenCalledWith('testId', prismaMock)
        expect(publishDomainWithLinksMock).not.toHaveBeenCalled()
      })

      it.each([
        [
          'passthroughOrigin',
          { passthroughOrigin: 'https://api.arclight.org' }
        ],
        ['kvNamespaceId', { kvNamespaceId: 'ns-2' }],
        ['kvBinding', { kvBinding: 'KV_NEW' }]
      ])(
        'should republish every link when %s changes',
        async (_field, change) => {
          prismaMock.shortLinkDomain.findUnique.mockResolvedValue(
            buildShortLinkDomain({ id: 'testId', kvNamespaceId: 'ns-1' })
          )
          prismaMock.shortLinkDomain.update.mockResolvedValue(
            buildShortLinkDomain({
              id: 'testId',
              kvNamespaceId: 'ns-1',
              ...change
            })
          )
          await authClient({
            document: SHORT_LINK_DOMAIN_UPDATE_MUTATION,
            variables: { input: { id: 'testId', services: [], ...change } }
          })
          expect(prismaMock.shortLinkDomain.update).toHaveBeenCalledWith({
            where: { id: 'testId' },
            data: { services: [], ...change }
          })
          expect(publishDomainWithLinksMock).toHaveBeenCalledWith(
            'testId',
            prismaMock
          )
          expect(publishDomainMock).not.toHaveBeenCalled()
        }
      )

      it('should clear the namespace and binding with empty strings', async () => {
        prismaMock.shortLinkDomain.findUnique.mockResolvedValue(
          buildShortLinkDomain({
            id: 'testId',
            kvNamespaceId: 'ns-1',
            kvBinding: 'KV_X'
          })
        )
        prismaMock.shortLinkDomain.update.mockResolvedValue(
          buildShortLinkDomain({ id: 'testId' })
        )
        await authClient({
          document: SHORT_LINK_DOMAIN_UPDATE_MUTATION,
          variables: {
            input: {
              id: 'testId',
              services: [],
              kvNamespaceId: '',
              kvBinding: ' '
            }
          }
        })
        expect(prismaMock.shortLinkDomain.update).toHaveBeenCalledWith({
          where: { id: 'testId' },
          data: { services: [], kvNamespaceId: null, kvBinding: null }
        })
        expect(publishDomainWithLinksMock).toHaveBeenCalledWith(
          'testId',
          prismaMock
        )
      })

      it.each([
        ['pathPrefix', { pathPrefix: 'go' }],
        ['kvNamespaceId', { kvNamespaceId: 'ns-2' }],
        ['kvBinding', { kvBinding: 'KV_NEW' }]
      ])(
        'should refuse an admin who is not a superAdmin changing %s',
        async (_field, change) => {
          setRoles(['shortLinkAdmin'])
          setSuperAdmin(false)
          prismaMock.shortLinkDomain.findUnique.mockResolvedValue(
            buildShortLinkDomain({
              id: 'testId',
              pathPrefix: 's',
              kvNamespaceId: 'ns-1',
              kvBinding: 'KV_X'
            })
          )
          const result = await authClient({
            document: SHORT_LINK_DOMAIN_UPDATE_MUTATION,
            variables: { input: { id: 'testId', services: [], ...change } }
          })
          expect(result).toMatchObject({
            errors: [
              expect.objectContaining({
                message:
                  'only a superAdmin may change the path prefix, KV namespace or Worker binding of a domain'
              })
            ]
          })
          expect(prismaMock.shortLinkDomain.update).not.toHaveBeenCalled()
        }
      )

      it('should let an admin who is not a superAdmin save the other settings', async () => {
        setRoles(['shortLinkAdmin'])
        setSuperAdmin(false)
        const existing = buildShortLinkDomain({
          id: 'testId',
          pathPrefix: 's',
          kvNamespaceId: 'ns-1',
          kvBinding: 'KV_X'
        })
        prismaMock.shortLinkDomain.findUnique.mockResolvedValue(existing)
        prismaMock.shortLinkDomain.update.mockResolvedValue({
          ...existing,
          redirectStatus: 301
        })
        const result = await authClient({
          document: SHORT_LINK_DOMAIN_UPDATE_MUTATION,
          variables: {
            input: {
              id: 'testId',
              services: [],
              redirectStatus: 301,
              // unchanged values are not an infrastructure change
              pathPrefix: 's',
              kvNamespaceId: 'ns-1',
              kvBinding: 'KV_X'
            }
          }
        })
        expect(result).toMatchObject({
          data: { shortLinkDomainUpdate: { data: { id: 'testId' } } }
        })
        expect(usersPrismaMock.user.findUnique).not.toHaveBeenCalled()
      })

      it('should refuse a binding outside the KV_ names api-media owns', async () => {
        prismaMock.shortLinkDomain.findUnique.mockResolvedValue(
          buildShortLinkDomain({ id: 'testId' })
        )
        const result = await authClient({
          document: SHORT_LINK_DOMAIN_UPDATE_MUTATION,
          variables: {
            input: { id: 'testId', services: [], kvBinding: 'SHORT_LINKS_KV' }
          }
        })
        expect(result).toMatchObject({
          data: {
            shortLinkDomainUpdate: {
              fieldErrors: [
                expect.objectContaining({ path: ['input', 'kvBinding'] })
              ]
            }
          }
        })
        expect(prismaMock.shortLinkDomain.update).not.toHaveBeenCalled()
      })

      it.each(['kv_lower', '1KV', 'KV-DASH', 'KV X'])(
        'should return a ZodError for the invalid binding %j',
        async (kvBinding) => {
          prismaMock.shortLinkDomain.findUnique.mockResolvedValue(
            buildShortLinkDomain({ id: 'testId' })
          )
          const result = await authClient({
            document: SHORT_LINK_DOMAIN_UPDATE_MUTATION,
            variables: { input: { id: 'testId', services: [], kvBinding } }
          })
          expect(result).toMatchObject({
            data: {
              shortLinkDomainUpdate: {
                fieldErrors: [
                  {
                    message: expect.stringContaining('kvBinding must be'),
                    path: ['input', 'kvBinding']
                  }
                ]
              }
            }
          })
          expect(prismaMock.shortLinkDomain.update).not.toHaveBeenCalled()
        }
      )

      it('should validate the merged settings', async () => {
        prismaMock.shortLinkDomain.findUnique.mockResolvedValue(
          buildShortLinkDomain({ id: 'testId' })
        )
        const result = await authClient({
          document: SHORT_LINK_DOMAIN_UPDATE_MUTATION,
          variables: {
            input: { id: 'testId', services: [], notFound: 'passthrough' }
          }
        })
        expect(result).toMatchObject({
          data: {
            shortLinkDomainUpdate: {
              fieldErrors: [
                {
                  message:
                    'passthroughOrigin is required when notFound is passthrough',
                  path: ['input', 'passthroughOrigin']
                }
              ]
            }
          }
        })
        expect(prismaMock.shortLinkDomain.update).not.toHaveBeenCalled()
      })

      it('should return a ZodError for an invalid redirectStatus', async () => {
        const result = await authClient({
          document: SHORT_LINK_DOMAIN_UPDATE_MUTATION,
          variables: {
            input: { id: 'testId', services: [], redirectStatus: 303 }
          }
        })
        expect(result).toMatchObject({
          data: {
            shortLinkDomainUpdate: {
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

      it('should return a NotFoundError if the short link domain does not exist', async () => {
        prismaMock.shortLinkDomain.findUnique.mockResolvedValue(null)
        const result = await authClient({
          document: SHORT_LINK_DOMAIN_UPDATE_MUTATION,
          variables: {
            input: {
              id: 'testId',
              services: ['apiJourneys']
            }
          }
        })
        expect(result).toEqual({
          data: {
            shortLinkDomainUpdate: {
              message: 'short link domain not found',
              location: [{ path: ['input', 'id'], value: 'testId' }]
            }
          }
        })
      })
    })

    describe('shortLinkDomainDelete', () => {
      const SHORT_LINK_DOMAIN_DELETE_MUTATION = graphql(`
        mutation ShortLinkDomainDeleteMutation($id: String!) {
          shortLinkDomainDelete(id: $id) {
            ... on MutationShortLinkDomainDeleteSuccess {
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
            ... on ForeignKeyConstraintError {
              message
              location {
                path
                value
              }
            }
          }
        }
      `)

      it('should refuse a publisher who is not a superAdmin', async () => {
        setSuperAdmin(false)
        const result = await authClient({
          document: SHORT_LINK_DOMAIN_DELETE_MUTATION,
          variables: { id: 'testId' }
        })
        expect(result).toMatchObject({ errors: [expect.anything()] })
        expect(prismaMock.shortLinkDomain.delete).not.toHaveBeenCalled()
      })

      it('should delete a short link domain and unpublish its record', async () => {
        mockRemoveVercelDomain.mockResolvedValue(true)
        prismaMock.shortLinkDomain.delete.mockResolvedValue(
          buildShortLinkDomain({ id: 'testId', hostname: 'www.example.com' })
        )
        const result = await authClient({
          document: SHORT_LINK_DOMAIN_DELETE_MUTATION,
          variables: { id: 'testId' }
        })
        expect(result).toEqual({
          data: {
            shortLinkDomainDelete: {
              data: {
                id: 'testId'
              }
            }
          }
        })
        expect(prismaMock.shortLinkDomain.delete).toHaveBeenCalledWith({
          where: { id: 'testId' }
        })
        expect(mockRemoveVercelDomain).toHaveBeenCalledWith('www.example.com')
        expect(unpublishDomainMock).toHaveBeenCalledWith('www.example.com')
      })

      it('should return a NotFoundError if the short link domain does not exist', async () => {
        prismaMock.shortLinkDomain.delete.mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError('No ShortLinkDomain found', {
            code: 'P2025',
            clientVersion: 'prismaVersion'
          })
        )
        const result = await authClient({
          document: SHORT_LINK_DOMAIN_DELETE_MUTATION,
          variables: { id: 'testId' }
        })
        expect(result).toEqual({
          data: {
            shortLinkDomainDelete: {
              message: 'short link domain not found',
              location: [{ path: ['id'], value: 'testId' }]
            }
          }
        })
        expect(mockRemoveVercelDomain).not.toHaveBeenCalledWith(
          'www.example.com'
        )
      })

      it('should return a ForeignKeyConstraintError if the short link domain has associated short links', async () => {
        prismaMock.shortLinkDomain.delete.mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError(
            'Foreign key constraint failed',
            {
              code: 'P2003',
              clientVersion: 'prismaVersion'
            }
          )
        )
        const result = await authClient({
          document: SHORT_LINK_DOMAIN_DELETE_MUTATION,
          variables: { id: 'testId' }
        })
        expect(result).toEqual({
          data: {
            shortLinkDomainDelete: {
              message: 'short link domain still has associated short links',
              location: [{ path: ['id'], value: 'testId' }]
            }
          }
        })
      })
    })

    describe('shortLinkDomainPublish', () => {
      const SHORT_LINK_DOMAIN_PUBLISH_MUTATION = graphql(`
        mutation ShortLinkDomainPublishMutation($id: String!) {
          shortLinkDomainPublish(id: $id) {
            ... on MutationShortLinkDomainPublishSuccess {
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

      it('should republish the domain and every live link for an admin', async () => {
        setRoles(['shortLinkAdmin'])
        prismaMock.shortLinkDomain.findUnique.mockResolvedValue(
          buildShortLinkDomain({ id: 'testId' })
        )
        const publishedAt = new Date('2026-09-26T10:00:00.000Z')
        publishDomainWithLinksMock.mockResolvedValue(publishedAt)
        const result = await authClient({
          document: SHORT_LINK_DOMAIN_PUBLISH_MUTATION,
          variables: { id: 'testId' }
        })
        expect(result).toEqual({
          data: {
            shortLinkDomainPublish: {
              data: { id: 'testId', edgePublishedAt: publishedAt.toISOString() }
            }
          }
        })
        expect(publishDomainWithLinksMock).toHaveBeenCalledWith('testId')
      })

      it('should republish for a superAdmin with no media role', async () => {
        setRoles([])
        prismaMock.shortLinkDomain.findUnique.mockResolvedValue(
          buildShortLinkDomain({ id: 'testId' })
        )
        const result = await authClient({
          document: SHORT_LINK_DOMAIN_PUBLISH_MUTATION,
          variables: { id: 'testId' }
        })
        expect(result).toMatchObject({
          data: { shortLinkDomainPublish: { data: { id: 'testId' } } }
        })
      })

      it('should refuse an editor who is not a superAdmin', async () => {
        setRoles(['shortLinkEditor'])
        setSuperAdmin(false)
        const result = await authClient({
          document: SHORT_LINK_DOMAIN_PUBLISH_MUTATION,
          variables: { id: 'testId' }
        })
        expect(result).toMatchObject({ errors: [expect.anything()] })
        expect(publishDomainWithLinksMock).not.toHaveBeenCalled()
      })

      it('should return a NotFoundError for an unknown domain', async () => {
        prismaMock.shortLinkDomain.findUnique.mockResolvedValue(null)
        const result = await authClient({
          document: SHORT_LINK_DOMAIN_PUBLISH_MUTATION,
          variables: { id: 'missing' }
        })
        expect(result).toEqual({
          data: {
            shortLinkDomainPublish: { message: 'short link domain not found' }
          }
        })
      })
    })
  })
})
