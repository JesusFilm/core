import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import {
  getIntegrationGoogleAccessToken,
  getTeamGoogleAccessToken
} from '../../../lib/google/googleAuth'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

jest.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: jest.fn()
}))

jest.mock('../../../lib/google/googleAuth', () => ({
  getIntegrationGoogleAccessToken: jest.fn(),
  getTeamGoogleAccessToken: jest.fn()
}))

const mockGetUserFromPayload = getUserFromPayload as jest.MockedFunction<
  typeof getUserFromPayload
>

const mockGetIntegrationGoogleAccessToken =
  getIntegrationGoogleAccessToken as jest.MockedFunction<
    typeof getIntegrationGoogleAccessToken
  >
const mockGetTeamGoogleAccessToken =
  getTeamGoogleAccessToken as jest.MockedFunction<
    typeof getTeamGoogleAccessToken
  >

describe('integrationGooglePickerToken', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const INTEGRATION_GOOGLE_PICKER_TOKEN_QUERY = graphql(`
    query IntegrationGooglePickerToken($teamId: ID!, $integrationId: ID) {
      integrationGooglePickerToken(
        teamId: $teamId
        integrationId: $integrationId
      )
    }
  `)

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser as any)
    prismaMock.userRole.findUnique.mockResolvedValue({
      userId: mockUser.id,
      roles: []
    } as any)
  })

  it('should return access token from specific integration', async () => {
    const mockTeam = {
      id: 'team-id',
      userTeams: [
        {
          userId: 'userId',
          role: 'member'
        }
      ],
      integrations: [
        {
          id: 'integration-1',
          type: 'google'
        },
        {
          id: 'integration-2',
          type: 'google'
        }
      ]
    }

    prismaMock.team.findUnique.mockResolvedValue(mockTeam as any)
    mockGetIntegrationGoogleAccessToken.mockResolvedValue({
      accessToken: 'integration-access-token',
      accountEmail: 'test@example.com'
    })

    const result = await authClient({
      document: INTEGRATION_GOOGLE_PICKER_TOKEN_QUERY,
      variables: {
        teamId: 'team-id',
        integrationId: 'integration-1'
      }
    })

    expect(prismaMock.team.findUnique).toHaveBeenCalledWith({
      where: { id: 'team-id' },
      include: { userTeams: true, integrations: true }
    })

    expect(mockGetIntegrationGoogleAccessToken).toHaveBeenCalledWith(
      'integration-1'
    )
    expect(mockGetTeamGoogleAccessToken).not.toHaveBeenCalled()

    expect(result).toEqual({
      data: {
        integrationGooglePickerToken: 'integration-access-token'
      }
    })
  })

  it('should return access token from team integration when integrationId is not provided', async () => {
    const mockTeam = {
      id: 'team-id',
      userTeams: [
        {
          userId: 'userId',
          role: 'member'
        }
      ],
      integrations: [
        {
          id: 'integration-1',
          type: 'google'
        }
      ]
    }

    prismaMock.team.findUnique.mockResolvedValue(mockTeam as any)
    mockGetTeamGoogleAccessToken.mockResolvedValue({
      accessToken: 'team-access-token',
      accountEmail: 'team@example.com'
    })

    const result = await authClient({
      document: INTEGRATION_GOOGLE_PICKER_TOKEN_QUERY,
      variables: {
        teamId: 'team-id'
      }
    })

    expect(mockGetTeamGoogleAccessToken).toHaveBeenCalledWith('team-id')
    expect(mockGetIntegrationGoogleAccessToken).not.toHaveBeenCalled()

    expect(result).toEqual({
      data: {
        integrationGooglePickerToken: 'team-access-token'
      }
    })
  })

  it('should throw error when user is not authenticated', async () => {
    mockGetUserFromPayload.mockReturnValue(null as any)
    const unauthClient = getClient({
      headers: { authorization: 'token' },
      context: { currentUser: null }
    })

    const result = await unauthClient({
      document: INTEGRATION_GOOGLE_PICKER_TOKEN_QUERY,
      variables: {
        teamId: 'team-id'
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: expect.stringContaining('Not authorized')
        })
      ]
    })
  })

  it('should throw error when team is not found', async () => {
    prismaMock.team.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: INTEGRATION_GOOGLE_PICKER_TOKEN_QUERY,
      variables: {
        teamId: 'non-existent-team'
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'Team not found'
        })
      ]
    })
  })

  it('should throw error when user is not a team member', async () => {
    const mockTeam = {
      id: 'team-id',
      userTeams: [
        {
          userId: 'other-user-id',
          role: 'member'
        }
      ],
      integrations: [
        {
          id: 'integration-1',
          type: 'google'
        }
      ]
    }

    prismaMock.team.findUnique.mockResolvedValue(mockTeam as any)

    const result = await authClient({
      document: INTEGRATION_GOOGLE_PICKER_TOKEN_QUERY,
      variables: {
        teamId: 'team-id'
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'Forbidden'
        })
      ]
    })
  })

  it('should throw error when Google integration is not configured', async () => {
    const mockTeam = {
      id: 'team-id',
      userTeams: [
        {
          userId: 'userId',
          role: 'member'
        }
      ],
      integrations: [
        {
          id: 'integration-1',
          type: 'slack'
        }
      ]
    }

    prismaMock.team.findUnique.mockResolvedValue(mockTeam as any)

    const result = await authClient({
      document: INTEGRATION_GOOGLE_PICKER_TOKEN_QUERY,
      variables: {
        teamId: 'team-id'
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'Google integration not configured'
        })
      ]
    })
  })
})
