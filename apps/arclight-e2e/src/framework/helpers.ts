// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()

export async function getBaseUrl(): Promise<string> {
  const baseUrl = process.env.DEPLOYMENT_URL?.toString()
  if (baseUrl == null || baseUrl === '') {
    throw new Error('baseUrl was not provided via environment variable')
  }
  return baseUrl
}
