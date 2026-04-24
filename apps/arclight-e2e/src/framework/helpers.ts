import path from 'node:path'

import { testData } from '../utils/testData'

const { loadPlaywrightEnv } = require('../../../../tools/e2e/playwright-load-env.cjs')
loadPlaywrightEnv(path.join(__dirname, '..', '..'))

export async function getBaseUrl(): Promise<string> {
  const baseUrl =
    process.env.ARCLIGHT_DAILY_E2E?.toString() ??
    process.env.DEPLOYMENT_URL?.toString()
  if (!baseUrl) {
    throw new Error(
      'baseUrl was not provided via environment variable (set ARCLIGHT_DAILY_E2E or DEPLOYMENT_URL)'
    )
  }
  return baseUrl.replace(/\/$/, '')
}

export function createQueryParams(
  params: Record<string, string | string[] | undefined>
): URLSearchParams {
  const queryParams = new URLSearchParams()

  // Only add default API key if no apiKey is provided in params
  if (!params.apiKey) {
    queryParams.append('apiKey', testData.apiKey)
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value != null) {
      if (Array.isArray(value)) {
        queryParams.append(key, value.join(','))
      } else {
        queryParams.append(key, value)
      }
    }
  })

  return queryParams
}
