import { type MockedFunction, vi } from 'vitest'

import { UserTeamRole } from '@core/prisma/journeys/client'
import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { mockQueueAdd } from '../../../test/bullmqMock'
import { campaignFactory } from '../../../test/campaignFactory'
import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

import { deleteVercelDomain, updateTeamShortLinks } from './service'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

vi.mock('./service', () => ({
  deleteVercelDomain: vi.fn().mockResolvedValue(true),
  updateTeamShortLinks: vi.fn().mockResolvedValue(undefined)
}))

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>

describe('customDomainDelete', () => {
  const mockUser = { id: 'userId', email: 'test@example.com' }

  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const CUSTOM_DOMAIN_DELETE_MUTATION = graphql(`
    mutation CustomDomainDelete($id: ID!) {
      customDomainDelete(id: $id) {
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
    prismaMock.$transaction.mockImplementation(async (fn: any) =>
      fn(prismaMock)
    )
  })

  it('should not fail when the short link rewrite rejects after the delete is committed', async () => {
    prismaMock.customDomain.findUnique.mockResolvedValue(mockCustomDomain)
    prismaMock.customDomain.delete.mockResolvedValue(mockCustomDomain)
    vi.mocked(updateTeamShortLinks).mockRejectedValueOnce(
      new Error('gateway down')
    )

    const result = await authClient({
      document: CUSTOM_DOMAIN_DELETE_MUTATION,
      variables: { id: 'customDomainId' }
    })

    expect(result).toEqual({
      data: {
        customDomainDelete: {
          id: 'customDomainId',
          name: 'example.com',
          apexName: 'example.com',
          routeAllTeamJourneys: true
        }
      }
    })
    expect(updateTeamShortLinks).toHaveBeenCalledWith('teamId')
  })

  it('should delete custom domain when authorized', async () => {
    prismaMock.customDomain.findUnique.mockResolvedValue(mockCustomDomain)
    prismaMock.customDomain.delete.mockResolvedValue(mockCustomDomain)

    const result = await authClient({
      document: CUSTOM_DOMAIN_DELETE_MUTATION,
      variables: { id: 'customDomainId' }
    })

    expect(result).toEqual({
      data: {
        customDomainDelete: {
          id: 'customDomainId',
          name: 'example.com',
          apexName: 'example.com',
          routeAllTeamJourneys: true
        }
      }
    })

    expect(updateTeamShortLinks).toHaveBeenCalledWith('teamId')
    expect(prismaMock.customDomain.delete).toHaveBeenCalledWith({
      where: { id: 'customDomainId' }
    })
    expect(deleteVercelDomain).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'customDomainId',
        name: 'example.com'
      })
    )
  })

  it('should change no campaign row when a domain with a Campaign Root is deleted', async () => {
    const attached = { ...mockCustomDomain, campaignId: 'campaignId' }
    prismaMock.customDomain.findUnique.mockResolvedValue(attached)
    prismaMock.customDomain.delete.mockResolvedValue(attached)

    await authClient({
      document: CUSTOM_DOMAIN_DELETE_MUTATION,
      variables: { id: 'customDomainId' }
    })

    expect(prismaMock.customDomain.delete).toHaveBeenCalledTimes(1)
    expect(prismaMock.campaign.update).not.toHaveBeenCalled()
    expect(prismaMock.campaign.updateMany).not.toHaveBeenCalled()
    expect(prismaMock.campaign.delete).not.toHaveBeenCalled()
  })

  it('should queue the released Campaign Root’s pages for the hostname when it is published', async () => {
    const campaign = campaignFactory().withRegion('EUR').published().build()
    const attached = {
      ...mockCustomDomain,
      name: 'outreach.example.org',
      campaignId: campaign.id,
      campaign
    }
    prismaMock.customDomain.findUnique.mockResolvedValue(attached)
    prismaMock.customDomain.delete.mockResolvedValue(attached)
    prismaMock.campaignLanguage.findMany.mockResolvedValue([])

    await authClient({
      document: CUSTOM_DOMAIN_DELETE_MUTATION,
      variables: { id: 'customDomainId' }
    })

    expect(prismaMock.customDomain.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          campaign: { include: { regions: true } }
        })
      })
    )
    expect(mockQueueAdd.mock.calls.map(([, data]) => data.paths[0])).toEqual([
      '/home/campaign/outreach-2026',
      '/home/campaign/outreach-2026/eur',
      '/outreach.example.org',
      '/outreach.example.org/eur'
    ])
  })

  it('should queue nothing for a domain whose Campaign Root is a draft', async () => {
    const campaign = campaignFactory().build()
    const attached = { ...mockCustomDomain, campaignId: campaign.id, campaign }
    prismaMock.customDomain.findUnique.mockResolvedValue(attached)
    prismaMock.customDomain.delete.mockResolvedValue(attached)

    await authClient({
      document: CUSTOM_DOMAIN_DELETE_MUTATION,
      variables: { id: 'customDomainId' }
    })

    expect(mockQueueAdd).not.toHaveBeenCalled()
  })

  it('should queue nothing for a domain with no Campaign Root', async () => {
    const unattached = { ...mockCustomDomain, campaign: null }
    prismaMock.customDomain.findUnique.mockResolvedValue(unattached)
    prismaMock.customDomain.delete.mockResolvedValue(mockCustomDomain)

    await authClient({
      document: CUSTOM_DOMAIN_DELETE_MUTATION,
      variables: { id: 'customDomainId' }
    })

    expect(prismaMock.customDomain.delete).toHaveBeenCalled()
    expect(mockQueueAdd).not.toHaveBeenCalled()
  })

  it('should return NOT_FOUND when custom domain does not exist', async () => {
    prismaMock.customDomain.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: CUSTOM_DOMAIN_DELETE_MUTATION,
      variables: { id: 'nonExistentId' }
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
      document: CUSTOM_DOMAIN_DELETE_MUTATION,
      variables: { id: 'customDomainId' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to delete custom domain'
        })
      ]
    })

    expect(prismaMock.customDomain.delete).not.toHaveBeenCalled()
    expect(deleteVercelDomain).not.toHaveBeenCalled()
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
      document: CUSTOM_DOMAIN_DELETE_MUTATION,
      variables: { id: 'customDomainId' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to delete custom domain'
        })
      ]
    })

    expect(prismaMock.customDomain.delete).not.toHaveBeenCalled()
    expect(deleteVercelDomain).not.toHaveBeenCalled()
  })
})
