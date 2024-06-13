import { TokenResponse } from 'adal-node'
import fetch, { FetchError, Response } from 'node-fetch'

import { getPowerBiAccessToken } from '../getPowerBiAccessToken'

import { getPowerBiEmbed } from '.'

jest.mock('node-fetch', () => {
  const originalModule = jest.requireActual('node-fetch')
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn()
  }
})
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

jest.mock('../getPowerBiAccessToken')
const mockGetPowerBiAccessToken = getPowerBiAccessToken as jest.MockedFunction<
  typeof getPowerBiAccessToken
>

describe('getPowerBiEmbed', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    mockGetPowerBiAccessToken.mockClear()
  })

  describe('getPowerBiEmbed', () => {
    it('should return embedInfo', async () => {
      const accessToken = 'accessToken'
      const tokenRequest = mockGetPowerBiAccessToken.mockResolvedValueOnce({
        accessToken
      } as unknown as TokenResponse)
      const reportRequest = mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () =>
          await Promise.resolve({
            id: 'reportId',
            name: 'reportName',
            embedUrl: 'embedUrl',
            datasetId: 'datasetId'
          })
      } as unknown as Response)
      const embedTokenRequest = mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () =>
          await Promise.resolve({
            token: accessToken,
            expiration: '2hr'
          })
      } as unknown as Response)
      await expect(
        getPowerBiEmbed(
          {
            clientId: 'clientId',
            clientSecret: 'clientSecret',
            tenantId: 'tenantId',
            workspaceId: 'workspaceId'
          },
          'reportId',
          'userId'
        )
      ).resolves.toEqual({
        reportId: 'reportId',
        reportName: 'reportName',
        embedUrl: 'embedUrl',
        accessToken,
        expiration: '2hr'
      })
      expect(tokenRequest).toHaveBeenCalledWith(
        'https://login.microsoftonline.com/common/v2.0',
        'clientId',
        'clientSecret',
        'https://analysis.windows.net/powerbi/api',
        'tenantId'
      )
      expect(reportRequest).toHaveBeenCalledWith(
        'https://api.powerbi.com/v1.0/myorg/groups/workspaceId/reports/reportId',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          method: 'GET'
        }
      )
      expect(embedTokenRequest).toHaveBeenCalledWith(
        'https://api.powerbi.com/v1.0/myorg/GenerateToken',
        {
          body: JSON.stringify({
            reports: [{ id: 'reportId' }],
            datasets: [{ id: 'datasetId' }],
            targetWorkspaces: [{ id: 'workspaceId' }],
            identities: [
              {
                username: 'userId',
                roles: ['Editor'],
                datasets: ['datasetId']
              }
            ]
          }),
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          method: 'POST'
        }
      )
    })

    it('should return handle tokenRequest ErrorResponse error', async () => {
      const tokenRequest = mockGetPowerBiAccessToken.mockRejectedValueOnce({
        error: 'error',
        errorDescription: 'errorDescription'
      })
      await expect(
        getPowerBiEmbed(
          {
            clientId: 'clientId',
            clientSecret: 'clientSecret',
            tenantId: 'tenantId',
            workspaceId: 'workspaceId'
          },
          'reportId',
          'userId'
        )
      ).rejects.toThrow('errorDescription')
      expect(tokenRequest).toHaveBeenCalledWith(
        'https://login.microsoftonline.com/common/v2.0',
        'clientId',
        'clientSecret',
        'https://analysis.windows.net/powerbi/api',
        'tenantId'
      )
    })

    it('should return handle tokenRequest error', async () => {
      const tokenRequest = mockGetPowerBiAccessToken.mockRejectedValueOnce(
        new Error('error')
      )
      await expect(
        getPowerBiEmbed(
          {
            clientId: 'clientId',
            clientSecret: 'clientSecret',
            tenantId: 'tenantId',
            workspaceId: 'workspaceId'
          },
          'reportId',
          'userId'
        )
      ).rejects.toThrow('error')
      expect(tokenRequest).toHaveBeenCalledWith(
        'https://login.microsoftonline.com/common/v2.0',
        'clientId',
        'clientSecret',
        'https://analysis.windows.net/powerbi/api',
        'tenantId'
      )
    })

    it('should return handle reportRequest error', async () => {
      const accessToken = 'accessToken'
      const tokenRequest = mockGetPowerBiAccessToken.mockResolvedValueOnce({
        accessToken
      } as unknown as TokenResponse)
      const reportRequest = mockFetch.mockRejectedValueOnce(
        new FetchError(
          'uri requested responds with an invalid redirect URL',
          'invalid-redirect'
        )
      )
      await expect(
        getPowerBiEmbed(
          {
            clientId: 'clientId',
            clientSecret: 'clientSecret',
            tenantId: 'tenantId',
            workspaceId: 'workspaceId'
          },
          'reportId',
          'userId'
        )
      ).rejects.toThrow('uri requested responds with an invalid redirect URL')
      expect(tokenRequest).toHaveBeenCalledWith(
        'https://login.microsoftonline.com/common/v2.0',
        'clientId',
        'clientSecret',
        'https://analysis.windows.net/powerbi/api',
        'tenantId'
      )
      expect(reportRequest).toHaveBeenCalledWith(
        'https://api.powerbi.com/v1.0/myorg/groups/workspaceId/reports/reportId',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          method: 'GET'
        }
      )
    })

    it('should return handle embedTokenRequest error', async () => {
      const accessToken = 'accessToken'
      const tokenRequest = mockGetPowerBiAccessToken.mockResolvedValueOnce({
        accessToken
      } as unknown as TokenResponse)
      const reportRequest = mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () =>
          await Promise.resolve({
            id: 'reportId',
            name: 'reportName',
            embedUrl: 'embedUrl',
            datasetId: 'datasetId'
          })
      } as unknown as Response)
      const embedTokenRequest = mockFetch.mockRejectedValueOnce(
        new FetchError(
          'uri requested responds with an invalid redirect URL',
          'invalid-redirect'
        )
      )
      await expect(
        getPowerBiEmbed(
          {
            clientId: 'clientId',
            clientSecret: 'clientSecret',
            tenantId: 'tenantId',
            workspaceId: 'workspaceId'
          },
          'reportId',
          'userId'
        )
      ).rejects.toThrow('uri requested responds with an invalid redirect URL')
      expect(tokenRequest).toHaveBeenCalledWith(
        'https://login.microsoftonline.com/common/v2.0',
        'clientId',
        'clientSecret',
        'https://analysis.windows.net/powerbi/api',
        'tenantId'
      )
      expect(reportRequest).toHaveBeenCalledWith(
        'https://api.powerbi.com/v1.0/myorg/groups/workspaceId/reports/reportId',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          method: 'GET'
        }
      )
      expect(embedTokenRequest).toHaveBeenCalledWith(
        'https://api.powerbi.com/v1.0/myorg/GenerateToken',
        {
          body: JSON.stringify({
            reports: [{ id: 'reportId' }],
            datasets: [{ id: 'datasetId' }],
            targetWorkspaces: [{ id: 'workspaceId' }],
            identities: [
              {
                username: 'userId',
                roles: ['Editor'],
                datasets: ['datasetId']
              }
            ]
          }),
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          method: 'POST'
        }
      )
    })
  })
})
