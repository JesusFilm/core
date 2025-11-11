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


