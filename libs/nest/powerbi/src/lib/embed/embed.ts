import { getAccessToken } from '../authentication'
import { PowerBiConfig, defaultPowerBiConfig } from '../config'
import fetch, { FetchError } from 'node-fetch'

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

/**
 * Generate embed token and embed urls for reports
 * @return Details like Embed URL, Access token and Expiry
 */
export async function getEmbedInfo(
  config: Optional<PowerBiConfig, 'apiUrl' | 'authorityUri' | 'scope'>,
  reportId: string,
  userId: string
): Promise<{
  id: string
  name: string
  url: string
  token: {
    token: string
    expiration: string
  }
}> {
  const {
    apiUrl,
    workspaceId,
    authorityUri,
    clientId,
    clientSecret,
    scope,
    tenantId
  } = {
    ...defaultPowerBiConfig,
    ...config
  }
  try {
    return await getEmbedParamsForSingleReport(
      apiUrl,
      workspaceId,
      reportId,
      userId,
      await getRequestHeader(
        authorityUri,
        clientId,
        clientSecret,
        scope,
        tenantId
      )
    )
  } catch (err) {
    if (err.hasOwnProperty('errorDescription') && err.hasOwnProperty('error')) {
      throw new Error(err.errorDescription)
    } else if (err instanceof FetchError) {
      throw new Error(err.message)
    } else {
      throw new Error(err.toString())
    }
  }
}

/**
 * Get embed params for a single report for a single workspace
 */
async function getEmbedParamsForSingleReport(
  apiUrl: string,
  workspaceId: string,
  reportId: string,
  userId: string,
  headers
): Promise<{
  id: string
  name: string
  url: string
  token: {
    token: string
    expiration: string
  }
}> {
  const result = await fetch(
    `${apiUrl}v1.0/myorg/groups/${workspaceId}/reports/${reportId}`,
    {
      method: 'GET',
      headers
    }
  )

  const { id, name, embedUrl, datasetId } = await result.json()

  return {
    id: id as string,
    name: name as string,
    url: embedUrl as string,
    token: await getEmbedTokenForSingleReportSingleWorkspace(
      apiUrl,
      reportId,
      userId,
      [{ id: datasetId }],
      workspaceId,
      headers
    )
  }
}

/**
 * Get Embed token for single report, multiple datasets, and an optional target workspace
 */
async function getEmbedTokenForSingleReportSingleWorkspace(
  apiUrl: string,
  reportId: string,
  userId: string,
  datasets: { id: string }[],
  workspaceId: string,
  headers
): Promise<{ token: string; expiration: string }> {
  const result = await fetch(`${apiUrl}v1.0/myorg/GenerateToken`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      reports: [{ id: reportId }],
      datasets,
      targetWorkspaces: [{ id: workspaceId }],
      identities: [
        {
          username: userId,
          roles: ['Equipment Team'],
          datasets
        }
      ]
    })
  })

  return result.json()
}

/**
 * Get Request header
 */
async function getRequestHeader(
  authorityUri: string,
  clientId: string,
  clientSecret: string,
  scope: string,
  tenantId: string
): Promise<{
  'Content-Type': 'application/json'
  Authorization: string
}> {
  const tokenResponse = await getAccessToken(
    authorityUri,
    clientId,
    clientSecret,
    scope,
    tenantId
  )
  return {
    'Content-Type': 'application/json',
    Authorization: 'Bearer '.concat(tokenResponse.accessToken)
  }
}
