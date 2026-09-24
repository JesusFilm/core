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

const mockUser = {
  id: 'userId',
  email: 'test@example.com',
  emailVerified: true,
  firstName: 'Test',
  lastName: 'User',
  imageUrl: null,
  roles: []
}

describe('campaign / campaigns queries', () => {
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })
  const publicClient = getClient()

  const CAMPAIGN = graphql(`
    query Campaign($id: ID!) {
      campaign(id: $id) {
        id
        title
        slug
        status
        shareJourneys {
          id
          status
        }
      }
    }
  `)

  const CAMPAIGNS = graphql(`
    query Campaigns($teamId: ID!) {
      campaigns(teamId: $teamId) {
        id
        title
      }
    }
  `)

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.userRole.findUnique.mockResolvedValue({
      id: 'userRoleId',
      userId: mockUser.id,
      roles: []
    })
    prismaMock.userTeam.findFirst.mockResolvedValue({
      id: 'ut',
      teamId: 'team-1',
      userId: mockUser.id
    } as any)
  })

  it('campaign: returns a draft campaign (drafts journeys included) to a team member', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue({
      id: 'c1',
      teamId: 'team-1'
    } as any)
    prismaMock.campaign.findUniqueOrThrow.mockResolvedValue({
      id: 'c1',
      teamId: 'team-1',
      title: 'World Cup',
      slug: 'world-cup',
      status: 'draft',
      journeys: [
        {
          role: 'share',
          order: 0,
          journey: {
            id: 'j-draft',
            title: 'Draft',
            slug: 'draft',
            status: 'draft',
            teamId: 'team-1',
            template: null,
            languageId: '529'
          }
        }
      ]
    } as any)

    const result = await authClient({
      document: CAMPAIGN,
      variables: { id: 'c1' }
    })

    expect(result).toEqual({
      data: {
        campaign: {
          id: 'c1',
          title: 'World Cup',
          slug: 'world-cup',
          status: 'draft',
          shareJourneys: [{ id: 'j-draft', status: 'draft' }]
        }
      }
    })
    expect(prismaMock.campaign.findUnique).toHaveBeenCalledWith({
      where: { id: 'c1' },
      select: { id: true, teamId: true }
    })
  })

  it('campaign: throws NOT_FOUND when the id does not resolve', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: CAMPAIGN,
      variables: { id: 'missing' }
    })

    expect(result).toEqual({
      data: null,
      errors: [expect.objectContaining({ message: 'campaign not found' })]
    })
    expect(prismaMock.campaign.findUniqueOrThrow).not.toHaveBeenCalled()
  })

  it('campaign: throws FORBIDDEN when the caller is not in the team', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue({
      id: 'c1',
      teamId: 'team-OTHER'
    } as any)
    prismaMock.userTeam.findFirst.mockResolvedValue(null)

    const result = await authClient({
      document: CAMPAIGN,
      variables: { id: 'c1' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to read campaign'
        })
      ]
    })
    expect(prismaMock.campaign.findUniqueOrThrow).not.toHaveBeenCalled()
  })

  it('campaign: rejects anonymous callers without touching the DB', async () => {
    mockGetUserFromPayload.mockReturnValue(null)

    const result = await publicClient({
      document: CAMPAIGN,
      variables: { id: 'c1' }
    })

    expect(result).toMatchObject({
      data: null,
      errors: [
        expect.objectContaining({
          message: expect.stringContaining('Not authorized')
        })
      ]
    })
    expect(prismaMock.campaign.findUnique).not.toHaveBeenCalled()
  })

  it('campaigns: lists the team campaigns newest first', async () => {
    prismaMock.campaign.findMany.mockResolvedValue([
      { id: 'c2', title: 'Second' },
      { id: 'c1', title: 'First' }
    ] as any)

    const result = await authClient({
      document: CAMPAIGNS,
      variables: { teamId: 'team-1' }
    })

    expect(result).toEqual({
      data: {
        campaigns: [
          { id: 'c2', title: 'Second' },
          { id: 'c1', title: 'First' }
        ]
      }
    })
    expect(prismaMock.campaign.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { teamId: 'team-1' },
        orderBy: { createdAt: 'desc' }
      })
    )
  })

  it('campaigns: rejects a caller outside the requested team', async () => {
    prismaMock.userTeam.findFirst.mockResolvedValue(null)

    const result = await authClient({
      document: CAMPAIGNS,
      variables: { teamId: 'team-OTHER' }
    })

    expect(result).toMatchObject({
      data: null,
      errors: [
        expect.objectContaining({
          message: expect.stringContaining('Not authorized')
        })
      ]
    })
    expect(prismaMock.campaign.findMany).not.toHaveBeenCalled()
  })
})
