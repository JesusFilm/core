import { type MockedFunction, vi } from 'vitest'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { campaignFactory } from '../../../test/campaignFactory'
import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>

describe('campaigns', () => {
  const mockUser = {
    id: 'userId',
    email: 'test@example.com',
    emailVerified: true,
    firstName: 'Test',
    lastName: 'User',
    imageUrl: null,
    roles: []
  }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const CAMPAIGNS = graphql(`
    query Campaigns($teamId: ID!) {
      campaigns(teamId: $teamId) {
        id
        title
        slug
        status
        createdAt
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
  })

  it("lists the team's campaigns newest first behind campaign Read", async () => {
    const older = campaignFactory({
      id: 'older',
      slug: 'older',
      createdAt: new Date('2025-10-01T00:00:00.000Z')
    }).build()
    const newer = campaignFactory({
      id: 'newer',
      slug: 'newer',
      createdAt: new Date('2026-10-01T00:00:00.000Z')
    })
      .published()
      .build()
    prismaMock.team.findUnique.mockResolvedValue(older.team)
    prismaMock.campaign.findMany.mockResolvedValue([newer, older])

    const result = await authClient({
      document: CAMPAIGNS,
      variables: { teamId: 'teamId' }
    })

    expect(result).toEqual({
      data: {
        campaigns: [
          {
            id: 'newer',
            title: 'Christmas 2026',
            slug: 'newer',
            status: 'published',
            createdAt: '2026-10-01T00:00:00.000Z'
          },
          {
            id: 'older',
            title: 'Christmas 2026',
            slug: 'older',
            status: 'draft',
            createdAt: '2025-10-01T00:00:00.000Z'
          }
        ]
      }
    })
    expect(prismaMock.team.findUnique).toHaveBeenCalledWith({
      where: { id: 'teamId' },
      include: { userTeams: true }
    })
    expect(prismaMock.campaign.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { teamId: 'teamId' },
        orderBy: { createdAt: 'desc' }
      })
    )
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    const fixture = campaignFactory({ userId: 'someoneElse' }).build()
    prismaMock.team.findUnique.mockResolvedValue(fixture.team)

    const result = await authClient({
      document: CAMPAIGNS,
      variables: { teamId: 'teamId' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to view campaigns',
          extensions: expect.objectContaining({ code: 'FORBIDDEN' })
        })
      ]
    })
    expect(prismaMock.campaign.findMany).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND for an unknown team', async () => {
    prismaMock.team.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: CAMPAIGNS,
      variables: { teamId: 'missing' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'team not found',
          extensions: expect.objectContaining({ code: 'NOT_FOUND' })
        })
      ]
    })
  })
})
