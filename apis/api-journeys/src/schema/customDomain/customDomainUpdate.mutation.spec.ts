import { type MockedFunction, vi } from 'vitest'

import { UserTeamRole } from '@core/prisma/journeys/client'
import { getUserFromPayload } from '@core/yoga/firebaseClient'

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

  describe('on a Campaign Domain', () => {
    const campaignDomain = {
      ...mockCustomDomain,
      campaignId: 'campaignId',
      routeAllTeamJourneys: false
    }

    it.each([
      { routeAllTeamJourneys: true },
      { journeyCollectionId: 'collectionId' },
      { journeyCollectionId: null }
    ])('refuses a routing change %o with BAD_USER_INPUT', async (input) => {
      prismaMock.customDomain.findUnique.mockResolvedValue(campaignDomain)

      const result = await authClient({
        document: CUSTOM_DOMAIN_UPDATE_MUTATION,
        variables: { id: 'customDomainId', input }
      })

      expect(result).toEqual({
        data: null,
        errors: [
          expect.objectContaining({
            message:
              'a campaign domain serves only its campaign and cannot be rerouted',
            extensions: expect.objectContaining({ code: 'BAD_USER_INPUT' })
          })
        ]
      })
      expect(prismaMock.customDomain.update).not.toHaveBeenCalled()
      expect(updateTeamShortLinks).not.toHaveBeenCalled()
    })

    it('is FORBIDDEN, not BAD_USER_INPUT, for a team member', async () => {
      const memberCampaignDomain = {
        ...campaignDomain,
        team: {
          ...campaignDomain.team,
          userTeams: [
            { ...campaignDomain.team.userTeams[0], role: UserTeamRole.member }
          ]
        }
      }
      prismaMock.customDomain.findUnique.mockResolvedValue(memberCampaignDomain)

      const result = await authClient({
        document: CUSTOM_DOMAIN_UPDATE_MUTATION,
        variables: {
          id: 'customDomainId',
          input: { routeAllTeamJourneys: true }
        }
      })

      expect(result).toEqual({
        data: null,
        errors: [
          expect.objectContaining({
            extensions: expect.objectContaining({ code: 'FORBIDDEN' })
          })
        ]
      })
    })
  })
})
