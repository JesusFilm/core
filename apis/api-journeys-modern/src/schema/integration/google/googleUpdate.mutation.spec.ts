import axios from 'axios'

import { encryptSymmetric } from '@core/yoga/crypto'
import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

jest.mock('axios')
jest.mock('@core/yoga/crypto', () => ({
  encryptSymmetric: jest.fn()
}))
jest.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: jest.fn()
}))

const mockGetUserFromPayload = getUserFromPayload as jest.MockedFunction<
  typeof getUserFromPayload
>

const mockAxios = axios as jest.Mocked<typeof axios>
const mockEncryptSymmetric = encryptSymmetric as jest.MockedFunction<
  typeof encryptSymmetric
>

describe('integrationGoogleUpdate', () => {
  const mockUser = {
    id: 'userId',
    email: 'test@example.com',
    emailVerified: true,
    firstName: 'Test',
    lastName: 'User',
    imageUrl: null
  }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const INTEGRATION_GOOGLE_UPDATE_MUTATION = graphql(`
    mutation IntegrationGoogleUpdate(
      $id: ID!
      $input: IntegrationGoogleUpdateInput!
    ) {
      integrationGoogleUpdate(id: $id, input: $input) {
        id
        type
        accountEmail
      }
    }
  `)

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.userRole.findUnique.mockResolvedValue({
      userId: mockUser.id,
      roles: []
    } as any)
  })

  it('should update Google integration', async () => {
    const mockExistingIntegration = {
      id: 'integration-id',
      userId: 'userId'
    }

    const mockTokenResponse = {
      data: {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
        scope: 'openid email',
        token_type: 'Bearer'
      }
    }

    const mockUserInfoResponse = {
      data: {
        email: 'updated@example.com',
        email_verified: true
      }
    }

    const mockUpdatedIntegration = {
      id: 'integration-id',
      type: 'google',
      teamId: 'team-id',
      userId: 'userId',
      accountEmail: 'updated@example.com'
    }

    prismaMock.integration.findUnique.mockResolvedValue(
      mockExistingIntegration as any
    )
    mockAxios.post.mockResolvedValueOnce(mockTokenResponse as any)
    mockAxios.get.mockResolvedValueOnce(mockUserInfoResponse as any)
    mockEncryptSymmetric.mockResolvedValue({
      ciphertext: 'encrypted-secret',
      iv: 'iv',
      tag: 'tag'
    })
    prismaMock.integration.update.mockResolvedValue(
      mockUpdatedIntegration as any
    )

    const result = await authClient({
      document: INTEGRATION_GOOGLE_UPDATE_MUTATION,
      variables: {
        id: 'integration-id',
        input: {
          code: 'new-auth-code',
          redirectUri: 'https://example.com/callback'
        }
      }
    })

    expect(prismaMock.integration.findUnique).toHaveBeenCalledWith({
      where: { id: 'integration-id' },
      select: { userId: true }
    })

    expect(mockAxios.post).toHaveBeenCalledWith(
      'https://oauth2.googleapis.com/token',
      expect.any(URLSearchParams),
      expect.objectContaining({
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
    )

    expect(prismaMock.integration.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'integration-id' },
        data: {
          accessSecretCipherText: 'encrypted-secret',
          accessSecretIv: 'iv',
          accessSecretTag: 'tag',
          accountEmail: 'updated@example.com',
          oauthStale: false
        }
      })
    )

    expect(result).toEqual({
      data: {
        integrationGoogleUpdate: expect.objectContaining({
          id: 'integration-id',
          type: 'google',
          accountEmail: 'updated@example.com'
        })
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
      document: INTEGRATION_GOOGLE_UPDATE_MUTATION,
      variables: {
        id: 'integration-id',
        input: {
          code: 'auth-code',
          redirectUri: 'https://example.com/callback'
        }
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
      document: INTEGRATION_GOOGLE_UPDATE_MUTATION,
      variables: {
        id: 'non-existent-integration',
        input: {
          code: 'auth-code',
          redirectUri: 'https://example.com/callback'
        }
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

  it('should throw error when user is not the integration owner', async () => {
    prismaMock.integration.findUnique.mockResolvedValue({
      id: 'integration-id',
      userId: 'other-user-id'
    } as any)

    const result = await authClient({
      document: INTEGRATION_GOOGLE_UPDATE_MUTATION,
      variables: {
        id: 'integration-id',
        input: {
          code: 'auth-code',
          redirectUri: 'https://example.com/callback'
        }
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

    expect(prismaMock.integration.update).not.toHaveBeenCalled()
  })

  it('should throw error when OAuth exchange fails', async () => {
    prismaMock.integration.findUnique.mockResolvedValue({
      id: 'integration-id',
      userId: 'userId'
    } as any)
    mockAxios.post.mockRejectedValueOnce(new Error('Invalid grant'))

    const result = await authClient({
      document: INTEGRATION_GOOGLE_UPDATE_MUTATION,
      variables: {
        id: 'integration-id',
        input: {
          code: 'invalid-code',
          redirectUri: 'https://example.com/callback'
        }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'Invalid grant',
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      ]
    })

    expect(prismaMock.integration.update).not.toHaveBeenCalled()
  })

  it('should throw a clear error when refresh token is not provided on update', async () => {
    const mockExistingIntegration = {
      id: 'integration-id',
      userId: 'userId'
    }

    const mockTokenResponse = {
      data: {
        access_token: 'access-token-only',
        expires_in: 3600,
        scope: 'openid email',
        token_type: 'Bearer'
      }
    }

    const mockUserInfoResponse = {
      data: {
        email: 'updated@example.com',
        email_verified: true
      }
    }

    prismaMock.integration.findUnique.mockResolvedValue(
      mockExistingIntegration as any
    )
    mockAxios.post.mockResolvedValueOnce(mockTokenResponse as any)
    mockAxios.get.mockResolvedValueOnce(mockUserInfoResponse as any)

    const result = await authClient({
      document: INTEGRATION_GOOGLE_UPDATE_MUTATION,
      variables: {
        id: 'integration-id',
        input: {
          code: 'auth-code',
          redirectUri: 'https://example.com/callback'
        }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message:
            'A Google refresh token is required to complete the connection. Please re-authorize your Google account.',
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      ]
    })

    expect(prismaMock.integration.update).not.toHaveBeenCalled()
  })
})
