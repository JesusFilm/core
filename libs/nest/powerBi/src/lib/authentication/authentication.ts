import { AuthenticationContext, TokenResponse, ErrorResponse } from 'adal-node'

export async function getAccessToken(
  authorityUri: string,
  clientId: string,
  clientSecret: string,
  scope: string,
  tenantId: string
): Promise<TokenResponse> {
  let context = new AuthenticationContext(
    authorityUri.replace('common', tenantId)
  )

  return new Promise((resolve, reject) => {
    context.acquireTokenWithClientCredentials(
      scope,
      clientId,
      clientSecret,
      (err, tokenResponse) => {
        // Function returns error object in tokenResponse
        // Invalid Username will return empty tokenResponse, thus err is used
        if (err) {
          reject(tokenResponse == null ? err : tokenResponse)
        }
        resolve(tokenResponse as TokenResponse)
      }
    )
  })
}
