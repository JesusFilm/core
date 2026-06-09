import { GraphQLError } from 'graphql'

export interface PowerBiEmbed {
  reportId: string
  reportName: string
  embedUrl: string
  accessToken: string
  expiration: string
}

interface PowerBiConfig {
  clientId: string
  clientSecret: string
  tenantId: string
  workspaceId: string
}

export async function getPowerBiEmbed(
  config: PowerBiConfig,
  reportId: string,
  userId: string
): Promise<PowerBiEmbed> {
  const tokenUrl = `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`
  const tokenBody = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: config.clientId,
    client_secret: config.clientSecret,
    scope: 'https://analysis.windows.net/powerbi/api/.default'
  })

  const tokenResponse = await fetch(tokenUrl, {
    method: 'POST',
    body: tokenBody
  })
  if (!tokenResponse.ok) {
    throw new GraphQLError('Failed to acquire Power BI access token', {
      extensions: { code: 'INTERNAL_SERVER_ERROR' }
    })
  }
  const tokenData = (await tokenResponse.json()) as { access_token: string }
  const accessToken = tokenData.access_token

  const reportUrl = `https://api.powerbi.com/v1.0/myorg/groups/${config.workspaceId}/reports/${reportId}`
  const reportResponse = await fetch(reportUrl, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  if (!reportResponse.ok) {
    throw new GraphQLError('Failed to fetch Power BI report details', {
      extensions: { code: 'INTERNAL_SERVER_ERROR' }
    })
  }
  const reportData = (await reportResponse.json()) as {
    id: string
    name: string
    embedUrl: string
    datasetId: string
  }

  const embedTokenUrl = `https://api.powerbi.com/v1.0/myorg/groups/${config.workspaceId}/reports/${reportId}/GenerateToken`
  const embedTokenResponse = await fetch(embedTokenUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      accessLevel: 'View',
      identities: [
        {
          username: userId,
          roles: ['viewer'],
          datasets: [reportData.datasetId]
        }
      ]
    })
  })
  if (!embedTokenResponse.ok) {
    throw new GraphQLError('Failed to generate Power BI embed token', {
      extensions: { code: 'INTERNAL_SERVER_ERROR' }
    })
  }
  const embedTokenData = (await embedTokenResponse.json()) as {
    token: string
    expiration: string
  }

  return {
    reportId: reportData.id,
    reportName: reportData.name,
    embedUrl: reportData.embedUrl,
    accessToken: embedTokenData.token,
    expiration: embedTokenData.expiration
  }
}
