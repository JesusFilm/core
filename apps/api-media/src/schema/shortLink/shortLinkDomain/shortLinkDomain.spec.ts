import { Prisma } from '.prisma/api-media-client'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

describe('shortLinkDomain', () => {
  const client = getClient()

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
          {
            id: 'testId',
            hostname: 'example.com',
            createdAt: new Date(),
            updatedAt: new Date(),
            services: []
          }
        ])
        prismaMock.shortLinkDomain.count.mockResolvedValue(1)
        const result = await client({
          document: SHORT_LINK_DOMAINS_QUERY
        })
        expect(result).toEqual({
          data: {
            shortLinkDomains: {
              edges: [
                {
                  node: {
                    id: 'testId',
                    hostname: 'example.com',
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    services: []
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
          {
            id: 'testId',
            hostname: 'example.com',
            createdAt: new Date(),
            updatedAt: new Date(),
            services: ['apiJourneys']
          }
        ])
        prismaMock.shortLinkDomain.count.mockResolvedValue(1)
        const result = await client({
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
                    hostname: 'example.com',
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    services: ['apiJourneys']
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

      it('should fetch a short link domain by id', async () => {
        prismaMock.shortLinkDomain.findFirstOrThrow.mockResolvedValue({
          id: 'testId',
          hostname: 'example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          services: []
        })
        const result = await client({
          document: SHORT_LINK_DOMAIN_QUERY,
          variables: { id: 'testId' }
        })
        expect(result).toEqual({
          data: {
            shortLinkDomain: {
              data: {
                id: 'testId',
                hostname: 'example.com',
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
                services: []
              }
            }
          }
        })
        expect(
          prismaMock.shortLinkDomain.findFirstOrThrow
        ).toHaveBeenCalledWith({
          where: { id: 'testId' }
        })
      })

      it('should return a NotFoundError if the short link domain does not exist', async () => {
        prismaMock.shortLinkDomain.findFirstOrThrow.mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError('No ShortLinkDomain found', {
            code: 'P2025',
            clientVersion: 'prismaVersion'
          })
        )
        const result = await client({
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

  describe('mutations', () => {
    beforeEach(() => {
      prismaMock.userMediaRole.findUnique.mockResolvedValue({
        id: 'userId',
        userId: 'userId',
        roles: ['publisher']
      })
    })

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
          }
        }
      `)

      it('should create a short link domain', async () => {
        prismaMock.shortLinkDomain.create.mockResolvedValue({
          id: 'testId',
          hostname: 'example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          services: ['apiJourneys']
        })
        const result = await client({
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
                hostname: 'example.com',
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
            services: ['apiJourneys']
          }
        })
      })

      it('should create a short link domain with no services provided', async () => {
        prismaMock.shortLinkDomain.create.mockResolvedValue({
          id: 'testId',
          hostname: 'example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          services: []
        })
        const result = await client({
          document: SHORT_LINK_DOMAIN_CREATE_MUTATION,
          variables: {
            input: {
              hostname: 'example.com'
            }
          }
        })
        expect(result).toEqual({
          data: {
            shortLinkDomainCreate: {
              data: {
                id: 'testId',
                hostname: 'example.com',
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
                services: []
              }
            }
          }
        })
        expect(prismaMock.shortLinkDomain.create).toHaveBeenCalledWith({
          data: {
            hostname: 'example.com',
            services: []
          }
        })
      })

      it('should return a NotUniqueError if the short link domain already exists', async () => {
        prismaMock.shortLinkDomain.create.mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
            code: 'P2002',
            clientVersion: 'prismaVersion'
          })
        )
        const result = await client({
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
              message: 'short link domain already exists',
              location: [{ path: ['input', 'hostname'], value: 'example.com' }]
            }
          }
        })
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
          }
        }
      `)

      it('should update a short link domain', async () => {
        prismaMock.shortLinkDomain.update.mockResolvedValue({
          id: 'testId',
          hostname: 'example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          services: ['apiJourneys']
        })
        const result = await client({
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
                hostname: 'example.com',
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
      })

      it('should return a NotFoundError if the short link domain does not exist', async () => {
        prismaMock.shortLinkDomain.update.mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError('No ShortLinkDomain found', {
            code: 'P2025',
            clientVersion: 'prismaVersion'
          })
        )
        const result = await client({
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

      it('should delete a short link domain', async () => {
        prismaMock.shortLinkDomain.delete.mockResolvedValue({
          id: 'testId',
          hostname: 'example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          services: []
        })
        const result = await client({
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
      })

      it('should return a NotFoundError if the short link domain does not exist', async () => {
        prismaMock.shortLinkDomain.delete.mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError('No ShortLinkDomain found', {
            code: 'P2025',
            clientVersion: 'prismaVersion'
          })
        )
        const result = await client({
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
        const result = await client({
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
  })
})
