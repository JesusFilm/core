export interface PowerBiConfig {
  apiUrl?: string
  authorityUri?: string
  clientId: string
  clientSecret: string
  scope?: string
  tenantId: string
  workspaceId: string
}

export const defaultPowerBiConfig = {
  apiUrl: 'https://api.powerbi.com/',
  authorityUri: 'https://login.microsoftonline.com/common/v2.0',
  scope: 'https://analysis.windows.net/powerbi/api'
}
