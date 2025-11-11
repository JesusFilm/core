import axios from 'axios'

import { decryptSymmetric } from '@core/nest/common/crypto'

import { prismaMock } from '../../../test/prismaMock'

import {
  getIntegrationGoogleAccessToken,
  getTeamGoogleAccessToken
} from './googleAuth'

jest.mock('axios')
jest.mock('@core/nest/common/crypto', () => ({
  decryptSymmetric: jest.fn()
}))

const mockAxios = axios as jest.Mocked<typeof axios>
const mockDecryptSymmetric = decryptSymmetric as jest.MockedFunction<
  typeof decryptSymmetric
>

describe('googleAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.GOOGLE_CLIENT_ID = 'test-client-id'
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret'
    process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET = 'test-secret'
  })

  afterEach(() => {
    delete process.env.GOOGLE_CLIENT_ID
    delete process.env.GOOGLE_CLIENT_SECRET
    delete process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET
  })

  describe('getTeamGoogleAccessToken', () => {
    it('should return access token from refresh token', async () => {
      const mockIntegration = {
        accessSecretCipherText: 'ciphertext',
        accessSecretIv: 'iv',
        accessSecretTag: 'tag',
        accountEmail: 'test@example.com'
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
          accessSecretCipherText: true,
          accessSecretIv: true,
          accessSecretTag: true,
          accountEmail: true
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
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      )

      expect(result).toEqual({
        accessToken: 'new-access-token',
        accountEmail: 'test@example.com'
      })
    })

    it('should fallback to using secret as access token when refresh fails', async () => {
      const mockIntegration = {
        accessSecretCipherText: 'ciphertext',
        accessSecretIv: 'iv',
        accessSecretTag: 'tag',
        accountEmail: 'test@example.com'
      }

      prismaMock.integration.findFirst.mockResolvedValue(mockIntegration as any)
      mockDecryptSymmetric.mockResolvedValue('access-token-direct')
      mockAxios.post.mockRejectedValue(new Error('Token refresh failed'))

      const result = await getTeamGoogleAccessToken('team-id')

      expect(result).toEqual({
        accessToken: 'access-token-direct',
        accountEmail: 'test@example.com'
      })
    })

    it('should throw error when integration not configured', async () => {
      prismaMock.integration.findFirst.mockResolvedValue(null)

      await expect(getTeamGoogleAccessToken('team-id')).rejects.toThrow(
        'Google integration not configured for this team'
      )
    })

    it('should throw error when integration missing required fields', async () => {
      prismaMock.integration.findFirst.mockResolvedValue({
        accessSecretCipherText: null,
        accessSecretIv: 'iv',
        accessSecretTag: 'tag',
        accountEmail: 'test@example.com'
      } as any)

      await expect(getTeamGoogleAccessToken('team-id')).rejects.toThrow(
        'Google integration not configured for this team'
      )
    })

    it('should throw error when OAuth client not configured', async () => {
      delete process.env.GOOGLE_CLIENT_ID

      const mockIntegration = {
        accessSecretCipherText: 'ciphertext',
        accessSecretIv: 'iv',
        accessSecretTag: 'tag',
        accountEmail: 'test@example.com'
      }

      prismaMock.integration.findFirst.mockResolvedValue(mockIntegration as any)
      mockDecryptSymmetric.mockResolvedValue('refresh-token')

      await expect(getTeamGoogleAccessToken('team-id')).rejects.toThrow(
        'Google OAuth client is not configured'
      )
    })
  })

  describe('getIntegrationGoogleAccessToken', () => {
    it('should return access token from refresh token', async () => {
      const mockIntegration = {
        accessSecretCipherText: 'ciphertext',
        accessSecretIv: 'iv',
        accessSecretTag: 'tag',
        accountEmail: 'integration@example.com'
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
          accessSecretCipherText: true,
          accessSecretIv: true,
          accessSecretTag: true,
          accountEmail: true
        }
      })

      expect(result).toEqual({
        accessToken: 'integration-access-token',
        accountEmail: 'integration@example.com'
      })
    })

    it('should fallback to using secret as access token when refresh fails', async () => {
      const mockIntegration = {
        accessSecretCipherText: 'ciphertext',
        accessSecretIv: 'iv',
        accessSecretTag: 'tag',
        accountEmail: 'integration@example.com'
      }

      prismaMock.integration.findUnique.mockResolvedValue(
        mockIntegration as any
      )
      mockDecryptSymmetric.mockResolvedValue('direct-access-token')
      mockAxios.post.mockRejectedValue(new Error('Refresh failed'))

      const result = await getIntegrationGoogleAccessToken('integration-id')

      expect(result).toEqual({
        accessToken: 'direct-access-token',
        accountEmail: 'integration@example.com'
      })
    })

    it('should throw error when integration not found', async () => {
      prismaMock.integration.findUnique.mockResolvedValue(null)

      await expect(
        getIntegrationGoogleAccessToken('integration-id')
      ).rejects.toThrow('Google integration not found')
    })

    it('should throw error when integration missing required fields', async () => {
      prismaMock.integration.findUnique.mockResolvedValue({
        accessSecretCipherText: 'ciphertext',
        accessSecretIv: null,
        accessSecretTag: 'tag',
        accountEmail: 'test@example.com'
      } as any)

      await expect(
        getIntegrationGoogleAccessToken('integration-id')
      ).rejects.toThrow('Google integration not found')
    })

    it('should throw error when OAuth client not configured', async () => {
      delete process.env.GOOGLE_CLIENT_SECRET

      const mockIntegration = {
        accessSecretCipherText: 'ciphertext',
        accessSecretIv: 'iv',
        accessSecretTag: 'tag',
        accountEmail: 'test@example.com'
      }

      prismaMock.integration.findUnique.mockResolvedValue(
        mockIntegration as any
      )
      mockDecryptSymmetric.mockResolvedValue('refresh-token')

      await expect(
        getIntegrationGoogleAccessToken('integration-id')
      ).rejects.toThrow('Google OAuth client is not configured')
    })
  })
})
