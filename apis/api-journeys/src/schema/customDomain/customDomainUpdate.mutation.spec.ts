import { type MockedFunction, vi } from 'vitest'

import { UserTeamRole } from '@core/prisma/journeys/client'
import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { campaignFactory } from '../../../test/campaignFactory'
import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

const { mockQueueAdd } = vi.hoisted(() => ({
  mockQueueAdd: vi.fn()
}))

vi.mock('bullmq', () => ({
  Queue: vi.fn(function () {
    return { add: mockQueueAdd }
  })
}))

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>

describe('customDomainUpdate', () => {
  const mockUser = { id: 'userId', email: 'test@example.com' }

  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const CUSTOM_DOMAIN_UPDATE_MUTATION = graphql(`
    mutation CustomDomainUpdate($id: ID!, $input: CustomDomainUpdateInput!) {
      customDomainUpdate(id: $id, input: $input) {
        id
        name
        apexName
        routeAllTeamJourneys
      }
    }
  `)

  const mockCustomDomain = {
    id: 'customDomainId',
    teamId: 'teamId',
    name: 'example.com',
    apexName: 'example.com',
    journeyCollectionId: null,
    campaignId: null,
    routeAllTeamJourneys: true,
    team: {
      id: 'teamId',
      userTeams: [
        {
          id: 'userTeamId',
          teamId: 'teamId',
          userId: 'userId',
          role: UserTeamRole.manager,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockQueueAdd.mockResolvedValue(undefined)
    mockGetUserFromPayload.mockReturnValue(mockUser as any)
    prismaMock.userRole.findUnique.mockResolvedValue({
      userId: mockUser.id,
      roles: []
    } as any)
  })

  it('should update routeAllTeamJourneys', async () => {
    prismaMock.customDomain.findUnique.mockResolvedValue(mockCustomDomain)
    prismaMock.customDomain.update.mockResolvedValue({
      ...mockCustomDomain,
      routeAllTeamJourneys: false
    })

    const result = await authClient({
      document: CUSTOM_DOMAIN_UPDATE_MUTATION,
      variables: {
        id: 'customDomainId',
        input: { routeAllTeamJourneys: false }
      }
    })

    expect(result).toEqual({
      data: {
        customDomainUpdate: {
          id: 'customDomainId',
          name: 'example.com',
          apexName: 'example.com',
          routeAllTeamJourneys: false
        }
      }
    })

    expect(prismaMock.customDomain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'customDomainId' },
        data: {
          routeAllTeamJourneys: false,
          journeyCollection: undefined
        }
      })
    )
  })

  it('should update journeyCollectionId', async () => {
    prismaMock.customDomain.findUnique.mockResolvedValue(mockCustomDomain)
    prismaMock.journeyCollection.findFirst.mockResolvedValue({
      id: 'collectionId',
      teamId: 'teamId'
    } as any)
    prismaMock.customDomain.update.mockResolvedValue({
      ...mockCustomDomain,
      journeyCollectionId: 'collectionId'
    })

    const result = await authClient({
      document: CUSTOM_DOMAIN_UPDATE_MUTATION,
      variables: {
        id: 'customDomainId',
        input: { journeyCollectionId: 'collectionId' }
      }
    })

    expect(result).toEqual({
      data: {
        customDomainUpdate: {
          id: 'customDomainId',
          name: 'example.com',
          apexName: 'example.com',
          routeAllTeamJourneys: true
        }
      }
    })

    expect(prismaMock.journeyCollection.findFirst).toHaveBeenCalledWith({
      where: { id: 'collectionId', teamId: 'teamId' }
    })
    expect(prismaMock.customDomain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'customDomainId' },
        data: {
          routeAllTeamJourneys: undefined,
          journeyCollection: { connect: { id: 'collectionId' } }
        }
      })
    )
  })

  it('should disconnect journeyCollection when journeyCollectionId is null', async () => {
    prismaMock.customDomain.findUnique.mockResolvedValue(mockCustomDomain)
    prismaMock.customDomain.update.mockResolvedValue({
      ...mockCustomDomain,
      journeyCollectionId: null
    })

    const result = await authClient({
      document: CUSTOM_DOMAIN_UPDATE_MUTATION,
      variables: {
        id: 'customDomainId',
        input: { journeyCollectionId: null }
      }
    })

    expect(result).toEqual({
      data: {
        customDomainUpdate: {
          id: 'customDomainId',
          name: 'example.com',
          apexName: 'example.com',
          routeAllTeamJourneys: true
        }
      }
    })

    expect(prismaMock.customDomain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'customDomainId' },
        data: {
          routeAllTeamJourneys: undefined,
          journeyCollection: { disconnect: true }
        }
      })
    )
  })

  it('should return FORBIDDEN when journeyCollectionId belongs to another team', async () => {
    prismaMock.customDomain.findUnique.mockResolvedValue(mockCustomDomain)
    prismaMock.journeyCollection.findFirst.mockResolvedValue(null)

    const result = await authClient({
      document: CUSTOM_DOMAIN_UPDATE_MUTATION,
      variables: {
        id: 'customDomainId',
        input: { journeyCollectionId: 'otherTeamCollectionId' }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'journey collection not found for this custom domain team'
        })
      ]
    })

    expect(prismaMock.journeyCollection.findFirst).toHaveBeenCalledWith({
      where: { id: 'otherTeamCollectionId', teamId: 'teamId' }
    })
    expect(prismaMock.customDomain.update).not.toHaveBeenCalled()
  })

  it('should return NOT_FOUND when custom domain does not exist', async () => {
    prismaMock.customDomain.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: CUSTOM_DOMAIN_UPDATE_MUTATION,
      variables: {
        id: 'nonExistentId',
        input: { routeAllTeamJourneys: false }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'custom domain not found'
        })
      ]
    })
  })

  it('should return FORBIDDEN when user is not a team manager', async () => {
    const unauthorizedCustomDomain = {
      ...mockCustomDomain,
      team: {
        id: 'teamId',
        userTeams: [
          {
            id: 'userTeamId',
            teamId: 'teamId',
            userId: 'userId',
            role: UserTeamRole.member,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      }
    }

    prismaMock.customDomain.findUnique.mockResolvedValue(
      unauthorizedCustomDomain
    )

    const result = await authClient({
      document: CUSTOM_DOMAIN_UPDATE_MUTATION,
      variables: {
        id: 'customDomainId',
        input: { routeAllTeamJourneys: false }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to update custom domain'
        })
      ]
    })

    expect(prismaMock.customDomain.update).not.toHaveBeenCalled()
  })

  it('should return FORBIDDEN when user is not in the team', async () => {
    const noAccessCustomDomain = {
      ...mockCustomDomain,
      team: {
        id: 'teamId',
        userTeams: []
      }
    }

    prismaMock.customDomain.findUnique.mockResolvedValue(noAccessCustomDomain)

    const result = await authClient({
      document: CUSTOM_DOMAIN_UPDATE_MUTATION,
      variables: {
        id: 'customDomainId',
        input: { routeAllTeamJourneys: false }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to update custom domain'
        })
      ]
    })

    expect(prismaMock.customDomain.update).not.toHaveBeenCalled()
  })

  describe('campaignId (Campaign Root)', () => {
    const CAMPAIGN_ROOT_MUTATION = graphql(`
      mutation CustomDomainUpdateCampaignRoot(
        $id: ID!
        $input: CustomDomainUpdateInput!
      ) {
        customDomainUpdate(id: $id, input: $input) {
          id
          campaignId
          routeAllTeamJourneys
        }
      }
    `)

    const campaign = campaignFactory({ role: 'manager' })
      .withRegion('EUR')
      .withRegion('AFR')
      .build()

    it('connects the Campaign Root and queues one job per landing and region path in both forms', async () => {
      prismaMock.customDomain.findUnique.mockResolvedValue(mockCustomDomain)
      prismaMock.campaign.findFirst.mockResolvedValue(campaign)
      prismaMock.campaign.findMany.mockResolvedValue([campaign])
      prismaMock.customDomain.update.mockResolvedValue({
        ...mockCustomDomain,
        campaignId: 'campaignId'
      })

      const result = await authClient({
        document: CAMPAIGN_ROOT_MUTATION,
        variables: { id: 'customDomainId', input: { campaignId: 'campaignId' } }
      })

      expect(result).toEqual({
        data: {
          customDomainUpdate: {
            id: 'customDomainId',
            campaignId: 'campaignId',
            routeAllTeamJourneys: true
          }
        }
      })
      expect(prismaMock.campaign.findFirst).toHaveBeenCalledWith({
        where: { id: 'campaignId', teamId: 'teamId' }
      })
      expect(prismaMock.customDomain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            routeAllTeamJourneys: undefined,
            journeyCollection: undefined,
            campaign: { connect: { id: 'campaignId' } }
          })
        })
      )
      expect(mockQueueAdd.mock.calls).toEqual([
        ['revalidate', { paths: ['/home/campaign/christmas-2026'] }],
        ['revalidate', { paths: ['/home/campaign/christmas-2026/eur'] }],
        ['revalidate', { paths: ['/home/campaign/christmas-2026/afr'] }],
        ['revalidate', { paths: ['/example.com'] }],
        ['revalidate', { paths: ['/example.com/eur'] }],
        ['revalidate', { paths: ['/example.com/afr'] }]
      ])
    })

    it('is not exclusive with routeAllTeamJourneys or a journey collection', async () => {
      prismaMock.customDomain.findUnique.mockResolvedValue(mockCustomDomain)
      prismaMock.campaign.findFirst.mockResolvedValue(campaign)
      prismaMock.campaign.findMany.mockResolvedValue([campaign])
      prismaMock.journeyCollection.findFirst.mockResolvedValue({
        id: 'collectionId',
        teamId: 'teamId'
      } as any)
      prismaMock.customDomain.update.mockResolvedValue({
        ...mockCustomDomain,
        campaignId: 'campaignId'
      })

      await authClient({
        document: CAMPAIGN_ROOT_MUTATION,
        variables: {
          id: 'customDomainId',
          input: {
            campaignId: 'campaignId',
            journeyCollectionId: 'collectionId',
            routeAllTeamJourneys: true
          }
        }
      })

      expect(prismaMock.customDomain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            routeAllTeamJourneys: true,
            journeyCollection: { connect: { id: 'collectionId' } },
            campaign: { connect: { id: 'campaignId' } }
          }
        })
      )
    })

    it('clears the Campaign Root with null and revalidates the old campaign', async () => {
      prismaMock.customDomain.findUnique.mockResolvedValue({
        ...mockCustomDomain,
        campaignId: 'campaignId'
      })
      prismaMock.campaign.findMany.mockResolvedValue([campaign])
      prismaMock.customDomain.update.mockResolvedValue({
        ...mockCustomDomain,
        campaignId: null
      })

      const result = await authClient({
        document: CAMPAIGN_ROOT_MUTATION,
        variables: { id: 'customDomainId', input: { campaignId: null } }
      })

      expect(result).toEqual({
        data: {
          customDomainUpdate: {
            id: 'customDomainId',
            campaignId: null,
            routeAllTeamJourneys: true
          }
        }
      })
      expect(prismaMock.campaign.findFirst).not.toHaveBeenCalled()
      expect(prismaMock.customDomain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ campaign: { disconnect: true } })
        })
      )
      expect(mockQueueAdd).toHaveBeenCalledTimes(6)
    })

    it('revalidates both campaigns when the domain is repointed', async () => {
      const other = campaignFactory({ role: 'manager', slug: 'easter' }).build()
      prismaMock.customDomain.findUnique.mockResolvedValue({
        ...mockCustomDomain,
        campaignId: 'campaignId'
      })
      prismaMock.campaign.findFirst.mockResolvedValue({
        ...other,
        id: 'otherCampaignId'
      })
      prismaMock.campaign.findMany.mockResolvedValue([campaign, other])
      prismaMock.customDomain.update.mockResolvedValue({
        ...mockCustomDomain,
        campaignId: 'otherCampaignId'
      })

      await authClient({
        document: CAMPAIGN_ROOT_MUTATION,
        variables: {
          id: 'customDomainId',
          input: { campaignId: 'otherCampaignId' }
        }
      })

      expect(prismaMock.campaign.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: { in: ['campaignId', 'otherCampaignId'] } }
        })
      )
      expect(mockQueueAdd).toHaveBeenCalledTimes(8)
    })

    it('queues nothing when campaignId is unchanged or omitted', async () => {
      prismaMock.customDomain.findUnique.mockResolvedValue({
        ...mockCustomDomain,
        campaignId: 'campaignId'
      })
      prismaMock.campaign.findFirst.mockResolvedValue(campaign)
      prismaMock.customDomain.update.mockResolvedValue({
        ...mockCustomDomain,
        campaignId: 'campaignId'
      })

      await authClient({
        document: CAMPAIGN_ROOT_MUTATION,
        variables: { id: 'customDomainId', input: { campaignId: 'campaignId' } }
      })
      await authClient({
        document: CAMPAIGN_ROOT_MUTATION,
        variables: {
          id: 'customDomainId',
          input: { routeAllTeamJourneys: false }
        }
      })

      expect(mockQueueAdd).not.toHaveBeenCalled()
    })

    it('is BAD_USER_INPUT on field campaignId for a campaign of another team', async () => {
      prismaMock.customDomain.findUnique.mockResolvedValue(mockCustomDomain)
      prismaMock.campaign.findFirst.mockResolvedValue(null)

      const result = (await authClient({
        document: CAMPAIGN_ROOT_MUTATION,
        variables: {
          id: 'customDomainId',
          input: { campaignId: 'otherTeamCampaignId' }
        }
      })) as any

      expect(result.errors[0].extensions).toEqual(
        expect.objectContaining({
          code: 'BAD_USER_INPUT',
          field: 'campaignId'
        })
      )
      expect(prismaMock.campaign.findFirst).toHaveBeenCalledWith({
        where: { id: 'otherTeamCampaignId', teamId: 'teamId' }
      })
      expect(prismaMock.customDomain.update).not.toHaveBeenCalled()
      expect(mockQueueAdd).not.toHaveBeenCalled()
    })

    it('is FORBIDDEN for a team member', async () => {
      const memberCustomDomain = {
        ...mockCustomDomain,
        team: {
          ...mockCustomDomain.team,
          userTeams: [
            { ...mockCustomDomain.team.userTeams[0], role: UserTeamRole.member }
          ]
        }
      }
      prismaMock.customDomain.findUnique.mockResolvedValue(memberCustomDomain)

      const result = (await authClient({
        document: CAMPAIGN_ROOT_MUTATION,
        variables: { id: 'customDomainId', input: { campaignId: 'campaignId' } }
      })) as any

      expect(result.errors[0].extensions.code).toBe('FORBIDDEN')
      expect(prismaMock.customDomain.update).not.toHaveBeenCalled()
    })
  })
})
