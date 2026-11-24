import { type MockedFunction, vi } from 'vitest'

import { UserTeamRole } from '@core/prisma/journeys/client'
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

describe('Team', () => {
  const mockUser = { id: 'userId', email: 'test@example.com' }

  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const TEAM_CUSTOM_DOMAINS = graphql(`
    query TeamCustomDomains($id: ID!) {
      team(id: $id) {
        id
        customDomains {
          id
          name
        }
      }
    }
  `)

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser as any)
    prismaMock.userRole.findUnique.mockResolvedValue({
      userId: mockUser.id,
      roles: []
    } as any)
  })

  it('lists only the team’s own domains, leaving Campaign Domains out', async () => {
    prismaMock.team.findUnique.mockResolvedValue({
      id: 'teamId',
      userTeams: [
        { userId: mockUser.id, teamId: 'teamId', role: UserTeamRole.manager }
      ]
    } as any)
    prismaMock.team.findUniqueOrThrow.mockResolvedValue({
      id: 'teamId',
      customDomains: [{ id: 'customDomainId', name: 'team.example.com' }]
    } as any)

    const result = await authClient({
      document: TEAM_CUSTOM_DOMAINS,
      variables: { id: 'teamId' }
    })

    expect(result).toEqual({
      data: {
        team: {
          id: 'teamId',
          customDomains: [{ id: 'customDomainId', name: 'team.example.com' }]
        }
      }
    })
    expect(prismaMock.team.findUniqueOrThrow).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          customDomains: { where: { campaignId: null } }
        })
      })
    )
  })
})
