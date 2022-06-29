import { AuthenticationContext, TokenResponse } from 'adal-node'

export async function getPowerBiAccessToken(
  authorityUri: string,
  clientId: string,
  clientSecret: string,
  scope: string,
  tenantId: string
): Promise<TokenResponse> {
  const context = new AuthenticationContext(
    authorityUri.replace('common', tenantId)
  )

  return await new Promise((resolve, reject) => {
    context.acquireTokenWithClientCredentials(
      scope,
      clientId,
      clientSecret,
      (err, tokenResponse) => {
        if (err == null) {
          resolve(tokenResponse as TokenResponse)
        } else {
          // Function returns error object in tokenResponse
          // Invalid Username will return empty tokenResponse, thus err is used
          reject(tokenResponse == null ? err : tokenResponse)
        }
      }
    )
  })
}
