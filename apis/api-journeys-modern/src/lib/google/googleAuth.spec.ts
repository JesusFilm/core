import axios from 'axios'

import { decryptSymmetric } from '@core/yoga/crypto'

import { prismaMock } from '../../../test/prismaMock'

import {
  StaleOAuthError,
  getIntegrationGoogleAccessToken,
  getTeamGoogleAccessToken
} from './googleAuth'

jest.mock('axios')
jest.mock('@core/yoga/crypto', () => ({
  decryptSymmetric: jest.fn()
}))

const mockAxios = axios as jest.Mocked<typeof axios>
const mockDecryptSymmetric = decryptSymmetric as jest.MockedFunction<
  typeof decryptSymmetric
>

describe('googleAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getTeamGoogleAccessToken', () => {
    it('should return access token from refresh token', async () => {
      const mockIntegration = {
        id: 'integration-id',
        accessSecretCipherText: 'ciphertext',
        accessSecretIv: 'iv',
        accessSecretTag: 'tag',
        accountEmail: 'test@example.com',
        oauthStale: false
      }

      prismaMock.integration.findFirst.mockResolvedValue(mockIntegration as any)
      mockDecryptSymmetric.mockResolvedValue('refresh-token-123')
      mockAxios.post.mockResolvedValue({
        data: {
          access_token: 'new-access-token',
          expires_in: 3600
        }
      } as any)

      const result = await getTeamGoogleAccessToken('team-id')

      expect(prismaMock.integration.findFirst).toHaveBeenCalledWith({
        where: { teamId: 'team-id', type: 'google' },
        select: {
          id: true,
          accessSecretCipherText: true,
          accessSecretIv: true,
          accessSecretTag: true,
          accountEmail: true,
          oauthStale: true
        }
      })

      expect(mockDecryptSymmetric).toHaveBeenCalledWith(
        'ciphertext',
        'iv',
        'tag',
        'test-secret'
      )

      expect(mockAxios.post).toHaveBeenCalledWith(
        'https://oauth2.googleapis.com/token',
        expect.any(URLSearchParams),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
      )

      expect(result).toEqual({
        accessToken: 'new-access-token',
        accountEmail: 'test@example.com'
      })
    })

    it('should throw StaleOAuthError when integration is stale', async () => {
      const mockIntegration = {
        id: 'integration-id',
        accessSecretCipherText: 'ciphertext',
        accessSecretIv: 'iv',
        accessSecretTag: 'tag',
        accountEmail: 'test@example.com',
        oauthStale: true
      }

      prismaMock.integration.findFirst.mockResolvedValue(mockIntegration as any)

      await expect(getTeamGoogleAccessToken('team-id')).rejects.toThrow(
        StaleOAuthError
      )
      await expect(getTeamGoogleAccessToken('team-id')).rejects.toThrow(
        'Google integration OAuth credentials are stale. Re-authorization is required.'
      )

      // Should not attempt to decrypt or refresh
      expect(mockDecryptSymmetric).not.toHaveBeenCalled()
      expect(mockAxios.post).not.toHaveBeenCalled()
    })

    it('should throw re-authorization required error when refresh fails', async () => {
      const mockIntegration = {
        id: 'integration-id',
        accessSecretCipherText: 'ciphertext',
        accessSecretIv: 'iv',
        accessSecretTag: 'tag',
        accountEmail: 'test@example.com',
        oauthStale: false
      }

      prismaMock.integration.findFirst.mockResolvedValue(mockIntegration as any)
      mockDecryptSymmetric.mockResolvedValue('access-token-direct')
      mockAxios.post.mockRejectedValue(new Error('Token refresh failed'))

      await expect(getTeamGoogleAccessToken('team-id')).rejects.toThrow(
        'Failed to refresh Google OAuth token. Re-authorization is required to continue. Please reconnect your Google account.'
      )
    })

    it('should throw error when integration not configured', async () => {
      prismaMock.integration.findFirst.mockResolvedValue(null)

      await expect(getTeamGoogleAccessToken('team-id')).rejects.toThrow(
        'Google integration not configured for this team'
      )
    })

    it('should throw error when integration missing required fields', async () => {
      prismaMock.integration.findFirst.mockResolvedValue({
        id: 'integration-id',
        accessSecretCipherText: null,
        accessSecretIv: 'iv',
        accessSecretTag: 'tag',
        accountEmail: 'test@example.com',
        oauthStale: false
      } as any)

      await expect(getTeamGoogleAccessToken('team-id')).rejects.toThrow(
        'Google integration not configured for this team'
      )
    })
  })

  describe('getIntegrationGoogleAccessToken', () => {
    it('should return access token from refresh token', async () => {
      const mockIntegration = {
        teamId: 'team-id',
        accessSecretCipherText: 'ciphertext',
        accessSecretIv: 'iv',
        accessSecretTag: 'tag',
        accountEmail: 'integration@example.com',
        oauthStale: false
      }

      prismaMock.integration.findUnique.mockResolvedValue(
        mockIntegration as any
      )
      mockDecryptSymmetric.mockResolvedValue('refresh-token-456')
      mockAxios.post.mockResolvedValue({
        data: {
          access_token: 'integration-access-token',
          expires_in: 3600
        }
      } as any)

      const result = await getIntegrationGoogleAccessToken('integration-id')

      expect(prismaMock.integration.findUnique).toHaveBeenCalledWith({
        where: { id: 'integration-id' },
        select: {
          teamId: true,
          accessSecretCipherText: true,
          accessSecretIv: true,
          accessSecretTag: true,
          accountEmail: true,
          oauthStale: true
        }
      })

      expect(result).toEqual({
        accessToken: 'integration-access-token',
        accountEmail: 'integration@example.com'
      })
    })

    it('should throw StaleOAuthError when integration is stale', async () => {
      const mockIntegration = {
        teamId: 'team-id',
        accessSecretCipherText: 'ciphertext',
        accessSecretIv: 'iv',
        accessSecretTag: 'tag',
        accountEmail: 'integration@example.com',
        oauthStale: true
      }

      prismaMock.integration.findUnique.mockResolvedValue(
        mockIntegration as any
      )

      await expect(
        getIntegrationGoogleAccessToken('integration-id')
      ).rejects.toThrow(StaleOAuthError)
      await expect(
        getIntegrationGoogleAccessToken('integration-id')
      ).rejects.toThrow(
        'Google integration OAuth credentials are stale. Re-authorization is required.'
      )

      // Should not attempt to decrypt or refresh
      expect(mockDecryptSymmetric).not.toHaveBeenCalled()
      expect(mockAxios.post).not.toHaveBeenCalled()
    })

    it('should throw re-authorization required error when refresh fails', async () => {
      const mockIntegration = {
        teamId: 'team-id',
        accessSecretCipherText: 'ciphertext',
        accessSecretIv: 'iv',
        accessSecretTag: 'tag',
        accountEmail: 'integration@example.com',
        oauthStale: false
      }

      prismaMock.integration.findUnique.mockResolvedValue(
        mockIntegration as any
      )
      mockDecryptSymmetric.mockResolvedValue('direct-access-token')
      mockAxios.post.mockRejectedValue(new Error('Refresh failed'))

      await expect(
        getIntegrationGoogleAccessToken('integration-id')
      ).rejects.toThrow(
        'Failed to refresh Google OAuth token. Re-authorization is required to continue. Please reconnect your Google account.'
      )
    })

    it('should throw error when integration not found', async () => {
      prismaMock.integration.findUnique.mockResolvedValue(null)

      await expect(
        getIntegrationGoogleAccessToken('integration-id')
      ).rejects.toThrow('Google integration not found')
    })

    it('should throw error when integration missing required fields', async () => {
      prismaMock.integration.findUnique.mockResolvedValue({
        teamId: 'team-id',
        accessSecretCipherText: 'ciphertext',
        accessSecretIv: null,
        accessSecretTag: 'tag',
        accountEmail: 'test@example.com',
        oauthStale: false
      } as any)

      await expect(
        getIntegrationGoogleAccessToken('integration-id')
      ).rejects.toThrow('Google integration not found')
    })

    it('should throw error when OAuth client not configured', async () => {
      delete process.env.GOOGLE_CLIENT_SECRET

      const mockIntegration = {
        teamId: 'team-id',
        accessSecretCipherText: 'ciphertext',
        accessSecretIv: 'iv',
        accessSecretTag: 'tag',
        accountEmail: 'test@example.com',
        oauthStale: false
      }

      prismaMock.integration.findUnique.mockResolvedValue(
        mockIntegration as any
      )
      mockDecryptSymmetric.mockResolvedValue('refresh-token')
      mockAxios.post.mockRejectedValue(new Error('Token refresh failed'))

      await expect(
        getIntegrationGoogleAccessToken('integration-id')
      ).rejects.toThrow(
        'Failed to refresh Google OAuth token. Re-authorization is required to continue. Please reconnect your Google account.'
      )
    })
  })
})
