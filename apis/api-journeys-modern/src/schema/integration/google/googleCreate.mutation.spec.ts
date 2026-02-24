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

describe('integrationGoogleCreate', () => {
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

  const INTEGRATION_GOOGLE_CREATE_MUTATION = graphql(`
    mutation IntegrationGoogleCreate($input: IntegrationGoogleCreateInput!) {
      integrationGoogleCreate(input: $input) {
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
    // Pass isInTeam auth guard
    prismaMock.userTeam.findFirst.mockResolvedValue({ id: 'ut-1' } as any)
  })

  it('should create Google integration with refresh token', async () => {
    const mockTokenResponse = {
      data: {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
        scope: 'openid email',
        token_type: 'Bearer'
      }
    }

    const mockUserInfoResponse = {
      data: {
        email: 'test@example.com',
        email_verified: true
      }
    }

    const mockIntegration = {
      id: 'integration-id',
      type: 'google',
      teamId: 'team-id',
      userId: 'userId',
      accountEmail: 'test@example.com'
    }

    mockAxios.post.mockResolvedValueOnce(mockTokenResponse as any)
    mockAxios.get.mockResolvedValueOnce(mockUserInfoResponse as any)
    mockEncryptSymmetric.mockResolvedValue({
      ciphertext: 'encrypted-secret',
      iv: 'iv',
      tag: 'tag'
    })
    // No existing integration for this user with the same Google account
    prismaMock.integration.findUnique.mockResolvedValue(null)
    prismaMock.integration.create.mockResolvedValue(mockIntegration as any)

    const result = await authClient({
      document: INTEGRATION_GOOGLE_CREATE_MUTATION,
      variables: {
        input: {
          teamId: 'team-id',
          code: 'auth-code',
          redirectUri: 'https://example.com/callback'
        }
      }
    })

    expect(mockAxios.post).toHaveBeenCalledWith(
      'https://oauth2.googleapis.com/token',
      expect.any(URLSearchParams),
      expect.objectContaining({
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
    )

    expect(mockAxios.get).toHaveBeenCalledWith(
      'https://openidconnect.googleapis.com/v1/userinfo',
      expect.objectContaining({
        headers: { Authorization: 'Bearer access-token' }
      })
    )

    expect(mockEncryptSymmetric).toHaveBeenCalledWith(
      'refresh-token',
      'test-secret'
    )

    expect(prismaMock.integration.create).toHaveBeenCalledWith({
      include: { team: true },
      data: {
        type: 'google',
        teamId: 'team-id',
        userId: 'userId',
        accessSecretCipherText: 'encrypted-secret',
        accessSecretIv: 'iv',
        accessSecretTag: 'tag',
        accountEmail: 'test@example.com'
      }
    })

    expect(result).toEqual({
      data: {
        integrationGoogleCreate: expect.objectContaining({
          id: 'integration-id',
          type: 'google',
          accountEmail: 'test@example.com'
        })
      }
    })
  })

  it('should throw a clear error when refresh token is not provided', async () => {
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
        email: 'test@example.com',
        email_verified: true
      }
    }

    mockAxios.post.mockResolvedValueOnce(mockTokenResponse as any)
    mockAxios.get.mockResolvedValueOnce(mockUserInfoResponse as any)

    const result = await authClient({
      document: INTEGRATION_GOOGLE_CREATE_MUTATION,
      variables: {
        input: {
          teamId: 'team-id',
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

    expect(mockEncryptSymmetric).not.toHaveBeenCalled()
    expect(prismaMock.integration.create).not.toHaveBeenCalled()
  })

  it('should throw error when user is not authenticated', async () => {
    mockGetUserFromPayload.mockReturnValue(null as any)
    const unauthClient = getClient({
      headers: { authorization: 'token' },
      context: { currentUser: null }
    })

    const result = await unauthClient({
      document: INTEGRATION_GOOGLE_CREATE_MUTATION,
      variables: {
        input: {
          teamId: 'team-id',
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

  it('should throw error when OAuth exchange fails', async () => {
    mockAxios.post.mockRejectedValueOnce(new Error('Invalid grant'))

    const result = await authClient({
      document: INTEGRATION_GOOGLE_CREATE_MUTATION,
      variables: {
        input: {
          teamId: 'team-id',
          code: 'invalid-code',
          redirectUri: 'https://example.com/callback'
        }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'OAuth exchange failed',
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      ]
    })

    expect(prismaMock.integration.create).not.toHaveBeenCalled()
  })

  it('should handle userinfo fetch failure gracefully', async () => {
    const mockTokenResponse = {
      data: {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_in: 3600
      }
    }

    mockAxios.post.mockResolvedValueOnce(mockTokenResponse as any)
    mockAxios.get.mockRejectedValueOnce(new Error('Userinfo fetch failed'))

    const result = await authClient({
      document: INTEGRATION_GOOGLE_CREATE_MUTATION,
      variables: {
        input: {
          teamId: 'team-id',
          code: 'auth-code',
          redirectUri: 'https://example.com/callback'
        }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'OAuth exchange failed',
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      ]
    })
  })

  it('should throw error when user already has Google integration with same account', async () => {
    const mockTokenResponse = {
      data: {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
        scope: 'openid email',
        token_type: 'Bearer'
      }
    }

    const mockUserInfoResponse = {
      data: {
        email: 'existing@example.com',
        email_verified: true
      }
    }

    mockAxios.post.mockResolvedValueOnce(mockTokenResponse as any)
    mockAxios.get.mockResolvedValueOnce(mockUserInfoResponse as any)

    // Simulate existing integration with the same Google account for this user
    prismaMock.integration.findUnique.mockResolvedValue({
      id: 'existing-integration-id',
      type: 'google',
      teamId: 'other-team-id',
      userId: 'userId',
      accountEmail: 'existing@example.com'
    } as any)

    const result = await authClient({
      document: INTEGRATION_GOOGLE_CREATE_MUTATION,
      variables: {
        input: {
          teamId: 'team-id',
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
            'You have already linked this Google account (existing@example.com). Please use the existing integration or remove it first.',
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      ]
    })

    expect(prismaMock.integration.findUnique).toHaveBeenCalledWith({
      where: {
        userId_teamId_type_accountEmail: {
          userId: 'userId',
          teamId: 'team-id',
          type: 'google',
          accountEmail: 'existing@example.com'
        }
      }
    })

    expect(prismaMock.integration.create).not.toHaveBeenCalled()
  })

  it('should allow different users to link the same Google account', async () => {
    const mockTokenResponse = {
      data: {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
        scope: 'openid email',
        token_type: 'Bearer'
      }
    }

    const mockUserInfoResponse = {
      data: {
        email: 'shared@example.com',
        email_verified: true
      }
    }

    const mockIntegration = {
      id: 'new-integration-id',
      type: 'google',
      teamId: 'team-id',
      userId: 'userId',
      accountEmail: 'shared@example.com'
    }

    mockAxios.post.mockResolvedValueOnce(mockTokenResponse as any)
    mockAxios.get.mockResolvedValueOnce(mockUserInfoResponse as any)
    mockEncryptSymmetric.mockResolvedValue({
      ciphertext: 'encrypted-secret',
      iv: 'iv',
      tag: 'tag'
    })

    // No existing integration for this user (another user may have same email)
    prismaMock.integration.findUnique.mockResolvedValue(null)
    prismaMock.integration.create.mockResolvedValue(mockIntegration as any)

    const result = await authClient({
      document: INTEGRATION_GOOGLE_CREATE_MUTATION,
      variables: {
        input: {
          teamId: 'team-id',
          code: 'auth-code',
          redirectUri: 'https://example.com/callback'
        }
      }
    })

    expect(result).toEqual({
      data: {
        integrationGoogleCreate: expect.objectContaining({
          id: 'new-integration-id',
          type: 'google',
          accountEmail: 'shared@example.com'
        })
      }
    })

    expect(prismaMock.integration.create).toHaveBeenCalled()
  })
})
