import { type MockedFunction, vi } from 'vitest'

import { Prisma } from '@core/prisma/media/client'
import { graphql } from '@core/shared/gql'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import {
  buildShortLinkCampaign,
  buildShortLinkWithDomain,
  withRelations
} from '../../../../test/shortLinkFixtures'
import { publishLink } from '../edge'

vi.mock('../edge', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../edge')>()),
  publishLink: vi.fn(),
  unpublishLink: vi.fn(),
  publishDomain: vi.fn(),
  publishDomainWithLinks: vi.fn(),
  unpublishDomain: vi.fn()
}))

const publishLinkMock = publishLink as MockedFunction<typeof publishLink>

describe('shortLinkCampaign', () => {
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: { id: 'userId' } }
  })

  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.userMediaRole.findUnique.mockResolvedValue({
      id: 'userId',
      userId: 'testUserId',
      roles: ['shortLinkEditor'],
      createdAt: new Date(),
      updatedAt: new Date()
    })
    prismaMock.$transaction.mockImplementation(
      async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
        await callback(prismaMock)
    )
    publishLinkMock.mockResolvedValue(null)
  })

  describe('queries', () => {
    const SHORT_LINK_CAMPAIGNS_QUERY = graphql(`
      query ShortLinkCampaignsQuery($search: String) {
        shortLinkCampaigns(search: $search) {
          edges {
            node {
              id
              name
              tags
              ownerId
              linkCount
              shortLinks {
                id
              }
            }
          }
          totalCount
        }
      }
    `)

    it('lists campaigns with a name search', async () => {
      prismaMock.shortLinkCampaign.findMany.mockResolvedValue([
        withRelations(buildShortLinkCampaign(), {
          shortLinks: [buildShortLinkWithDomain()],
          _count: { shortLinks: 1 }
        })
      ])
      prismaMock.shortLinkCampaign.count.mockResolvedValue(1)
      const result = await authClient({
        document: SHORT_LINK_CAMPAIGNS_QUERY,
        variables: { search: 'spring' }
      })
      expect(result).toEqual({
        data: {
          shortLinkCampaigns: {
            edges: [
              {
                node: {
                  id: 'campaignId',
                  name: 'Spring push',
                  tags: [],
                  ownerId: 'testUserId',
                  linkCount: 1,
                  shortLinks: [{ id: 'testId' }]
                }
              }
            ],
            totalCount: 1
          }
        }
      })
      expect(prismaMock.shortLinkCampaign.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { name: { contains: 'spring', mode: 'insensitive' } },
          orderBy: { name: 'asc' }
        })
      )
      expect(prismaMock.shortLinkCampaign.count).toHaveBeenCalledWith({
        where: { name: { contains: 'spring', mode: 'insensitive' } }
      })
    })

    const SHORT_LINK_CAMPAIGN_QUERY = graphql(`
      query ShortLinkCampaignQuery($id: String!) {
        shortLinkCampaign(id: $id) {
          ... on QueryShortLinkCampaignSuccess {
            data {
              id
              name
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

    it('finds a campaign by id', async () => {
      prismaMock.shortLinkCampaign.findUnique.mockResolvedValue(
        buildShortLinkCampaign()
      )
      const result = await authClient({
        document: SHORT_LINK_CAMPAIGN_QUERY,
        variables: { id: 'campaignId' }
      })
      expect(result).toEqual({
        data: {
          shortLinkCampaign: { data: { id: 'campaignId', name: 'Spring push' } }
        }
      })
    })

    it('returns a NotFoundError for an unknown campaign', async () => {
      prismaMock.shortLinkCampaign.findUnique.mockResolvedValue(null)
      const result = await authClient({
        document: SHORT_LINK_CAMPAIGN_QUERY,
        variables: { id: 'missing' }
      })
      expect(result).toEqual({
        data: {
          shortLinkCampaign: {
            message: 'short link campaign not found',
            location: [{ path: ['id'], value: 'missing' }]
          }
        }
      })
    })

    it('refuses a caller without a short link role', async () => {
      prismaMock.userMediaRole.findUnique.mockResolvedValue({
        id: 'userId',
        userId: 'testUserId',
        roles: [],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      const result = await authClient({
        document: SHORT_LINK_CAMPAIGN_QUERY,
        variables: { id: 'campaignId' }
      })
      expect(result).toMatchObject({ errors: [expect.anything()] })
    })
  })

  describe('mutations', () => {
    it('creates a campaign owned by the caller', async () => {
      prismaMock.shortLinkCampaign.create.mockResolvedValue(
        buildShortLinkCampaign({ tags: ['yt'] })
      )
      const result = await authClient({
        document: graphql(`
          mutation ShortLinkCampaignCreateMutation(
            $input: MutationShortLinkCampaignCreateInput!
          ) {
            shortLinkCampaignCreate(input: $input) {
              id
              name
              tags
            }
          }
        `),
        variables: {
          input: {
            name: 'Spring push',
            description: 'March',
            startsAt: '2026-03-01T00:00:00.000Z',
            tags: ['yt']
          }
        }
      })
      expect(result).toEqual({
        data: {
          shortLinkCampaignCreate: {
            id: 'campaignId',
            name: 'Spring push',
            tags: ['yt']
          }
        }
      })
      expect(prismaMock.shortLinkCampaign.create).toHaveBeenCalledWith({
        data: {
          name: 'Spring push',
          description: 'March',
          startsAt: new Date('2026-03-01T00:00:00.000Z'),
          tags: ['yt'],
          ownerId: 'testUserId'
        }
      })
    })

    const SHORT_LINK_CAMPAIGN_UPDATE_MUTATION = graphql(`
      mutation ShortLinkCampaignUpdateMutation(
        $input: MutationShortLinkCampaignUpdateInput!
      ) {
        shortLinkCampaignUpdate(input: $input) {
          ... on MutationShortLinkCampaignUpdateSuccess {
            data {
              id
              name
            }
          }
          ... on NotFoundError {
            message
          }
        }
      }
    `)

    it('updates a campaign', async () => {
      prismaMock.shortLinkCampaign.update.mockResolvedValue(
        buildShortLinkCampaign({ name: 'Renamed' })
      )
      const result = await authClient({
        document: SHORT_LINK_CAMPAIGN_UPDATE_MUTATION,
        variables: {
          input: { id: 'campaignId', name: 'Renamed', description: null }
        }
      })
      expect(result).toEqual({
        data: {
          shortLinkCampaignUpdate: {
            data: { id: 'campaignId', name: 'Renamed' }
          }
        }
      })
      expect(prismaMock.shortLinkCampaign.update).toHaveBeenCalledWith({
        where: { id: 'campaignId' },
        data: { name: 'Renamed', description: null }
      })
    })

    it('returns a NotFoundError when updating an unknown campaign', async () => {
      prismaMock.shortLinkCampaign.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('No record', {
          code: 'P2025',
          clientVersion: 'prismaVersion'
        })
      )
      const result = await authClient({
        document: SHORT_LINK_CAMPAIGN_UPDATE_MUTATION,
        variables: { input: { id: 'missing', name: 'x' } }
      })
      expect(result).toEqual({
        data: {
          shortLinkCampaignUpdate: { message: 'short link campaign not found' }
        }
      })
    })

    const SHORT_LINK_CAMPAIGN_DELETE_MUTATION = graphql(`
      mutation ShortLinkCampaignDeleteMutation($id: String!) {
        shortLinkCampaignDelete(id: $id) {
          ... on MutationShortLinkCampaignDeleteSuccess {
            data {
              id
            }
          }
          ... on NotFoundError {
            message
          }
        }
      }
    `)

    it('deletes a campaign, detaching and republishing its links', async () => {
      prismaMock.shortLink.findMany.mockResolvedValue([
        buildShortLinkWithDomain({ id: 'l1' }),
        buildShortLinkWithDomain({ id: 'l2' })
      ])
      prismaMock.shortLinkCampaign.delete.mockResolvedValue(
        buildShortLinkCampaign()
      )
      const result = await authClient({
        document: SHORT_LINK_CAMPAIGN_DELETE_MUTATION,
        variables: { id: 'campaignId' }
      })
      expect(result).toEqual({
        data: { shortLinkCampaignDelete: { data: { id: 'campaignId' } } }
      })
      expect(prismaMock.shortLink.findMany).toHaveBeenCalledWith({
        where: { campaigns: { some: { id: 'campaignId' } }, deletedAt: null },
        select: { id: true }
      })
      expect(prismaMock.shortLinkCampaign.delete).toHaveBeenCalledWith({
        where: { id: 'campaignId' }
      })
      expect(prismaMock.shortLink.delete).not.toHaveBeenCalled()
      expect(prismaMock.shortLink.update).not.toHaveBeenCalled()
      expect(publishLinkMock).toHaveBeenCalledTimes(2)
      expect(publishLinkMock).toHaveBeenCalledWith('l1', prismaMock)
      expect(publishLinkMock).toHaveBeenCalledWith('l2', prismaMock)
    })

    it('returns a NotFoundError when deleting an unknown campaign', async () => {
      prismaMock.shortLink.findMany.mockResolvedValue([])
      prismaMock.shortLinkCampaign.delete.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('No record', {
          code: 'P2025',
          clientVersion: 'prismaVersion'
        })
      )
      const result = await authClient({
        document: SHORT_LINK_CAMPAIGN_DELETE_MUTATION,
        variables: { id: 'missing' }
      })
      expect(result).toEqual({
        data: {
          shortLinkCampaignDelete: { message: 'short link campaign not found' }
        }
      })
      expect(publishLinkMock).not.toHaveBeenCalled()
    })
  })
})
