import { type MockedFunction, vi } from 'vitest'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>

interface TeamDomainsResponse {
  data: {
    journey: {
      team: {
        customDomains: Array<{ id: string; campaignId: string | null }>
      }
    }
  }
  errors?: unknown[]
}

describe('CustomDomain.campaignId', () => {
  const mockUser = {
    id: 'userId',
    email: 'test@example.com',
    emailVerified: true,
    firstName: 'Test',
    lastName: 'User',
    imageUrl: null,
    roles: []
  }

  const publicClient = getClient()
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const TEAM_DOMAINS = graphql(`
    query JourneyTeamCustomDomains($id: ID!) {
      journey(id: $id, idType: databaseId) {
        id
        team {
          id
          customDomains {
            id
            campaignId
          }
        }
      }
    }
  `)

  function customDomain(
    id: string,
    campaignId: string | null
  ): Record<string, unknown> {
    return {
      id,
      teamId: 'teamId',
      name: `${id}.example.org`,
      apexName: 'example.org',
      journeyCollectionId: null,
      campaignId,
      routeAllTeamJourneys: false
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.journey.findUnique.mockResolvedValue({
      id: 'journeyId',
      teamId: 'teamId',
      team: {
        id: 'teamId',
        title: 'Team',
        publicTitle: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        customDomains: [
          customDomain('draftDomainId', 'draftCampaignId'),
          customDomain('publishedDomainId', 'publishedCampaignId'),
          customDomain('plainDomainId', null)
        ]
      }
    } as never)
    prismaMock.campaign.findUnique.mockImplementation((async ({
      where
    }: {
      where: { id: string }
    }) => ({
      status: where.id === 'publishedCampaignId' ? 'published' : 'draft'
    })) as never)
  })

  async function domains(
    client: typeof publicClient
  ): Promise<TeamDomainsResponse['data']['journey']['team']['customDomains']> {
    const result = (await client({
      document: TEAM_DOMAINS,
      variables: { id: 'journeyId' }
    })) as TeamDomainsResponse
    expect(result.errors).toBeUndefined()
    return result.data.journey.team.customDomains
  }

  it('is null for a draft campaign on an anonymous read, and names a published one', async () => {
    mockGetUserFromPayload.mockReturnValue(null)

    await expect(domains(publicClient)).resolves.toEqual([
      { id: 'draftDomainId', campaignId: null },
      { id: 'publishedDomainId', campaignId: 'publishedCampaignId' },
      { id: 'plainDomainId', campaignId: null }
    ])
    expect(prismaMock.userTeam.findUnique).not.toHaveBeenCalled()
  })

  it("is null for a draft campaign when the caller is not in the domain's team", async () => {
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.userTeam.findUnique.mockResolvedValue(null)

    await expect(domains(authClient)).resolves.toEqual([
      { id: 'draftDomainId', campaignId: null },
      { id: 'publishedDomainId', campaignId: 'publishedCampaignId' },
      { id: 'plainDomainId', campaignId: null }
    ])
  })

  it("names a draft campaign to a caller with campaign Read on the domain's team", async () => {
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.userTeam.findUnique.mockResolvedValue({
      id: 'userTeamId',
      teamId: 'teamId',
      userId: 'userId',
      role: 'member',
      createdAt: new Date(),
      updatedAt: new Date()
    } as never)

    await expect(domains(authClient)).resolves.toEqual([
      { id: 'draftDomainId', campaignId: 'draftCampaignId' },
      { id: 'publishedDomainId', campaignId: 'publishedCampaignId' },
      { id: 'plainDomainId', campaignId: null }
    ])
    expect(prismaMock.userTeam.findUnique).toHaveBeenCalledWith({
      where: { teamId_userId: { teamId: 'teamId', userId: 'userId' } }
    })
    expect(prismaMock.campaign.findUnique).not.toHaveBeenCalled()
  })
})
