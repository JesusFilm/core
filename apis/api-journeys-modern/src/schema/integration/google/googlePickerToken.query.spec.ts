import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { getIntegrationGoogleAccessToken } from '../../../lib/google/googleAuth'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

jest.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: jest.fn()
}))

jest.mock('../../../lib/google/googleAuth', () => ({
  getIntegrationGoogleAccessToken: jest.fn()
}))

const mockGetUserFromPayload = getUserFromPayload as jest.MockedFunction<
  typeof getUserFromPayload
>

const mockGetIntegrationGoogleAccessToken =
  getIntegrationGoogleAccessToken as jest.MockedFunction<
    typeof getIntegrationGoogleAccessToken
  >

describe('integrationGooglePickerToken', () => {
  const mockUser = { id: 'userId', email: 'test@example.com' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const INTEGRATION_GOOGLE_PICKER_TOKEN_QUERY = graphql(`
    query IntegrationGooglePickerToken($integrationId: ID!) {
      integrationGooglePickerToken(integrationId: $integrationId)
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
    prismaMock.integration.findUnique.mockResolvedValue({
      id: 'integration-1',
      userId: 'userId',
      type: 'google'
    } as any)
    mockGetIntegrationGoogleAccessToken.mockResolvedValue({
      accessToken: 'integration-access-token',
      accountEmail: 'test@example.com'
    })

    const result = await authClient({
      document: INTEGRATION_GOOGLE_PICKER_TOKEN_QUERY,
      variables: {
        integrationId: 'integration-1'
      }
    })

    expect(prismaMock.integration.findUnique).toHaveBeenCalledWith({
      where: { id: 'integration-1' }
    })

    expect(mockGetIntegrationGoogleAccessToken).toHaveBeenCalledWith(
      'integration-1'
    )

    expect(result).toEqual({
      data: {
        integrationGooglePickerToken: 'integration-access-token'
      }
    })
  })

  // teamId-based behavior no longer exists; integrationId is required

  it('should throw error when user is not authenticated', async () => {
    mockGetUserFromPayload.mockReturnValue(null as any)
    const unauthClient = getClient({
      headers: { authorization: 'token' },
      context: { currentUser: null }
    })

    const result = await unauthClient({
      document: INTEGRATION_GOOGLE_PICKER_TOKEN_QUERY,
      variables: {
        integrationId: 'integration-1'
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

  it('should throw error when integration is not found', async () => {
    prismaMock.integration.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: INTEGRATION_GOOGLE_PICKER_TOKEN_QUERY,
      variables: {
        integrationId: 'non-existent'
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'Integration not found'
        })
      ]
    })
  })

  it('should throw error when integration is not Google', async () => {
    prismaMock.integration.findUnique
      .mockResolvedValueOnce({ userId: 'userId' } as any)
      .mockResolvedValueOnce({ id: 'integration-1', type: 'slack' } as any)

    const result = await authClient({
      document: INTEGRATION_GOOGLE_PICKER_TOKEN_QUERY,
      variables: {
        integrationId: 'integration-1'
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'Integration is not a Google integration'
        })
      ]
    })
  })

  it('should throw error when user is not the integration owner', async () => {
    prismaMock.integration.findUnique.mockResolvedValue({
      userId: 'other-user-id'
    } as any)

    const result = await authClient({
      document: INTEGRATION_GOOGLE_PICKER_TOKEN_QUERY,
      variables: {
        integrationId: 'integration-1'
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
})
