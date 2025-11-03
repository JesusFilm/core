import { testData } from '../utils/testData'

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()

export async function getBaseUrl(): Promise<string> {
  const baseUrl = process.env.DEPLOYMENT_URL?.toString()
  if (!baseUrl) {
    throw new Error('baseUrl was not provided via environment variable')
  }
  return baseUrl
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
