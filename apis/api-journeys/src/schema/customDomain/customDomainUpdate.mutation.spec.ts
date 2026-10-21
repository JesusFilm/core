import { type MockedFunction, vi } from 'vitest'

import { UserTeamRole } from '@core/prisma/journeys/client'
import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { mockQueueAdd } from '../../../test/bullmqMock'
import { campaignFactory } from '../../../test/campaignFactory'
import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

import { updateTeamShortLinks } from './service'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

vi.mock('./service', () => ({
  updateTeamShortLinks: vi.fn().mockResolvedValue(undefined)
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

  describe('short link rewrite', () => {
    it('rewrites the team short links when routeAllTeamJourneys changes', async () => {
      prismaMock.customDomain.findUnique.mockResolvedValue(mockCustomDomain)
      prismaMock.customDomain.update.mockResolvedValue({
        ...mockCustomDomain,
        routeAllTeamJourneys: false
      })

      await authClient({
        document: CUSTOM_DOMAIN_UPDATE_MUTATION,
        variables: {
          id: 'customDomainId',
          input: { routeAllTeamJourneys: false }
        }
      })

      expect(updateTeamShortLinks).toHaveBeenCalledTimes(1)
      expect(updateTeamShortLinks).toHaveBeenCalledWith('teamId')
    })

    it('does not fail when the short link rewrite rejects after the update is committed', async () => {
      prismaMock.customDomain.findUnique.mockResolvedValue(mockCustomDomain)
      prismaMock.customDomain.update.mockResolvedValue({
        ...mockCustomDomain,
        routeAllTeamJourneys: false
      })
      vi.mocked(updateTeamShortLinks).mockRejectedValueOnce(
        new Error('gateway down')
      )

      const result = (await authClient({
        document: CUSTOM_DOMAIN_UPDATE_MUTATION,
        variables: {
          id: 'customDomainId',
          input: { routeAllTeamJourneys: false }
        }
      })) as any

      expect(result.errors).toBeUndefined()
      expect(result.data.customDomainUpdate).toMatchObject({
        id: 'customDomainId',
        routeAllTeamJourneys: false
      })
      expect(updateTeamShortLinks).toHaveBeenCalledWith('teamId')
    })

    it('rewrites the team short links when the journey collection changes', async () => {
      prismaMock.customDomain.findUnique.mockResolvedValue(mockCustomDomain)
      prismaMock.journeyCollection.findFirst.mockResolvedValue({
        id: 'collectionId',
        teamId: 'teamId'
      } as any)
      prismaMock.customDomain.update.mockResolvedValue({
        ...mockCustomDomain,
        journeyCollectionId: 'collectionId'
      })

      await authClient({
        document: CUSTOM_DOMAIN_UPDATE_MUTATION,
        variables: {
          id: 'customDomainId',
          input: { journeyCollectionId: 'collectionId' }
        }
      })

      expect(updateTeamShortLinks).toHaveBeenCalledWith('teamId')
    })

    it('does not rewrite when the submitted values match the stored ones', async () => {
      prismaMock.customDomain.findUnique.mockResolvedValue(mockCustomDomain)
      prismaMock.customDomain.update.mockResolvedValue(mockCustomDomain)

      await authClient({
        document: CUSTOM_DOMAIN_UPDATE_MUTATION,
        variables: {
          id: 'customDomainId',
          input: { routeAllTeamJourneys: true, journeyCollectionId: null }
        }
      })

      expect(updateTeamShortLinks).not.toHaveBeenCalled()
    })

    it('does not rewrite when only campaignId changes', async () => {
      const campaign = campaignFactory({ role: 'manager' }).build()
      prismaMock.customDomain.findUnique.mockResolvedValue(mockCustomDomain)
      prismaMock.campaign.findFirst.mockResolvedValue(campaign)
      prismaMock.campaign.findMany.mockResolvedValue([campaign])
      prismaMock.customDomain.update.mockResolvedValue({
        ...mockCustomDomain,
        campaignId: campaign.id
      })

      await authClient({
        document: CUSTOM_DOMAIN_UPDATE_MUTATION,
        variables: {
          id: 'customDomainId',
          input: { campaignId: campaign.id }
        }
      })

      expect(updateTeamShortLinks).not.toHaveBeenCalled()
    })
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
      // The draft root reads back to the manager through their team role.
      prismaMock.userTeam.findUnique.mockResolvedValue({
        id: 'userTeamId',
        teamId: 'teamId',
        userId: 'userId',
        role: 'manager',
        createdAt: new Date(),
        updatedAt: new Date()
      } as never)

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
      expect(mockQueueAdd.mock.calls.map(([, data]) => data.paths[0])).toEqual([
        '/home/campaign/outreach-2026',
        '/home/campaign/outreach-2026/eur',
        '/home/campaign/outreach-2026/afr',
        '/example.com',
        '/example.com/eur',
        '/example.com/afr'
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

    it('is FORBIDDEN for a campaign of another team', async () => {
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
        expect.objectContaining({ code: 'FORBIDDEN' })
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
