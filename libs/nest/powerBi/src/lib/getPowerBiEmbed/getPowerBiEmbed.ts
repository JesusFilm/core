import fetch, { FetchError } from 'node-fetch'

import { PowerBiConfig, defaultPowerBiConfig } from '../config'
import { getPowerBiAccessToken } from '../getPowerBiAccessToken'

export interface PowerBiEmbed {
  /**
   * The report ID
   */
  reportId: string
  /**
   * The name of the report
   */
  reportName: string
  /**
   * The embed URL of the report
   */
  embedUrl: string
  /**
   * The embed token
   */
  accessToken: string
  /**
   * The date and time (UTC) of token expiration
   */
  expiration: string
}

/**
 * Generate embed token and embed urls for reports
 * @return Details like Embed URL, Access token and Expiry
 */
export async function getPowerBiEmbed(
  config: PowerBiConfig,
  reportId: string,
  userId: string
): Promise<PowerBiEmbed> {
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
    const headers = await getRequestHeaders(
      authorityUri,
      clientId,
      clientSecret,
      scope,
      tenantId
    )
    return await getEmbedParamsForSingleReport(
      apiUrl,
      workspaceId,
      reportId,
      userId,
      headers
    )
  } catch (err) {
    if (
      Object.prototype.hasOwnProperty.call(err, 'errorDescription') === true &&
      Object.prototype.hasOwnProperty.call(err, 'error') === true
    ) {
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
  headers: RequestHeaders
): Promise<PowerBiEmbed> {
  const result = await fetch(
    `${apiUrl}v1.0/myorg/groups/${workspaceId}/reports/${reportId}`,
    {
      method: 'GET',
      headers
    }
  )

  const { id, name, embedUrl, datasetId } = await result.json()

  return {
    reportId: id as string,
    reportName: name as string,
    embedUrl: embedUrl as string,
    ...(await getEmbedTokenForSingleReportSingleWorkspace(
      apiUrl,
      reportId,
      userId,
      [datasetId],
      workspaceId,
      headers
    ))
  }
}

/**
 * Get Embed token for single report, multiple datasets, and an optional target workspace
 */
async function getEmbedTokenForSingleReportSingleWorkspace(
  apiUrl: string,
  reportId: string,
  userId: string,
  datasetIds: string[],
  workspaceId: string,
  headers: RequestHeaders
): Promise<{ accessToken: string; expiration: string }> {
  const result = await fetch(`${apiUrl}v1.0/myorg/GenerateToken`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      reports: [{ id: reportId }],
      datasets: datasetIds.map((datasetId) => ({
        id: datasetId
      })),
      targetWorkspaces: [{ id: workspaceId }],
      identities: [
        {
          username: userId,
          roles: ['Editor'],
          datasets: datasetIds
        }
      ]
    })
  })

  const { token, expiration } = await result.json()

  return { accessToken: token, expiration }
}

interface RequestHeaders {
  'Content-Type': 'application/json'
  Authorization: string
  [key: string]: string
}

/**
 * Get Request headers
 */
async function getRequestHeaders(
  authorityUri: string,
  clientId: string,
  clientSecret: string,
  scope: string,
  tenantId: string
): Promise<RequestHeaders> {
  const tokenResponse = await getPowerBiAccessToken(
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
