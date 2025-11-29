export const env = {
  get CLOUDFLARE_UPLOAD_KEY(): string {
    return 'test-cloudflare-account-hash'
  },
  get FACEBOOK_APP_ID(): string {
    return 'fb-app-id'
  },
  get FACEBOOK_APP_SECRET(): string {
    return 'fb-app-secret'
  },
  get GATEWAY_HMAC_SECRET(): string {
    // Dummy non-empty secret for any code that reads it directly in tests
    return 'test-gateway-hmac-secret'
  },
  get GATEWAY_URL(): string {
    return 'http://localhost/graphql'
  },
  get GOOGLE_CLIENT_ID(): string {
    return 'test-client-id'
  },
  get GOOGLE_CLIENT_SECRET(): string {
    return 'test-client-secret'
  },
  get INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET(): string {
    return 'test-secret'
  },
  get JOURNEYS_REVALIDATE_ACCESS_TOKEN(): string {
    return 'test-token'
  },
  get JOURNEYS_URL(): string {
    return 'https://example.com'
  }
}

export function getPlausibleEnv():
  | {
      PLAUSIBLE_URL: string
      PLAUSIBLE_API_KEY: string
    }
  | null {
  const PLAUSIBLE_URL = process.env.PLAUSIBLE_URL
  const PLAUSIBLE_API_KEY = process.env.PLAUSIBLE_API_KEY

  if (PLAUSIBLE_URL == null || PLAUSIBLE_API_KEY == null) return null
  return { PLAUSIBLE_URL, PLAUSIBLE_API_KEY }
}
