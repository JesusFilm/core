export const env = {
  get INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET(): string {
    return process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET ?? ''
  },
  get GOOGLE_CLIENT_ID(): string {
    return process.env.GOOGLE_CLIENT_ID ?? ''
  },
  get GOOGLE_CLIENT_SECRET(): string {
    return process.env.GOOGLE_CLIENT_SECRET ?? ''
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
