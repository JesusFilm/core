import { AuthenticationContext } from 'adal-node'

import { getPowerBiAccessToken } from '.'

jest.mock('adal-node', () => {
  return {
    AuthenticationContext: jest.fn()
  }
})
const mockAuthenticationContext = AuthenticationContext as jest.MockedClass<
  typeof AuthenticationContext
>

describe('getPowerBiAccessToken', () => {
  beforeEach(() => {
    mockAuthenticationContext.mockClear()
  })

  describe('getPowerBiAccessToken', () => {
    it('should return tokenResponse', async () => {
      const acquireTokenWithClientCredentials = jest.fn(
        (_scope, _clientId, _clientSecret, callback) => {
          callback(undefined, { accessToken: 'accessToken' })
        }
      )
      mockAuthenticationContext.mockImplementationOnce(
        () =>
          ({
            acquireTokenWithClientCredentials
          } as unknown as AuthenticationContext)
      )
      expect(
        await getPowerBiAccessToken(
          'https://login.microsoftonline.com/common/v2.0',
          'clientId',
          'clientSecret',
          'https://analysis.windows.net/powerbi/api',
          'tenantId'
        )
      ).toEqual({ accessToken: 'accessToken' })
      expect(mockAuthenticationContext).toHaveBeenCalledWith(
        'https://login.microsoftonline.com/tenantId/v2.0'
      )
      expect(acquireTokenWithClientCredentials).toHaveBeenCalledWith(
        'https://analysis.windows.net/powerbi/api',
        'clientId',
        'clientSecret',
        expect.any(Function)
      )
    })

    it('should return error', async () => {
      mockAuthenticationContext.mockImplementationOnce(() => {
        return {
          acquireTokenWithClientCredentials: (
            _scope,
            _clientId,
            _clientSecret,
            callback
          ) => {
            callback(new Error('error'), undefined)
          }
        } as unknown as AuthenticationContext
      })
      await expect(
        getPowerBiAccessToken(
          'https://login.microsoftonline.com/common/v2.0',
          'clientId',
          'clientSecret',
          'https://analysis.windows.net/powerbi/api',
          'tenantId'
        )
      ).rejects.toThrow('error')
    })

    it('should return error response', async () => {
      mockAuthenticationContext.mockImplementationOnce(() => {
        return {
          acquireTokenWithClientCredentials: (
            _scope,
            _clientId,
            _clientSecret,
            callback
          ) => {
            callback(new Error('error'), new Error('tokenResponse error'))
          }
        } as unknown as AuthenticationContext
      })
      await expect(
        getPowerBiAccessToken(
          'https://login.microsoftonline.com/common/v2.0',
          'clientId',
          'clientSecret',
          'https://analysis.windows.net/powerbi/api',
          'tenantId'
        )
      ).rejects.toThrow('tokenResponse error')
    })
  })
})
