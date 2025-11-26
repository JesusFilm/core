import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  runtimeEnv: process.env,
  skipValidation: process.env.SKIP_ENV_VALIDATION === '1',
  onValidationError: (issues) => {
    console.error('❌ Invalid environment variables:', issues)
    throw new Error('Invalid environment variables')
  },
  server: {
    INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET: z.string().trim().min(1),
    GOOGLE_CLIENT_ID: z.string().trim().min(1),
    GOOGLE_CLIENT_SECRET: z.string().trim().min(1)
  }
})

const plausibleEnvSchema = z.object({
  PLAUSIBLE_URL: z.string().url(),
  PLAUSIBLE_API_KEY: z.string().trim().min(1)
})

export function getPlausibleEnv(): {
  PLAUSIBLE_URL: string
  PLAUSIBLE_API_KEY: string
} | null {
  const parsed = plausibleEnvSchema.safeParse({
    PLAUSIBLE_URL: process.env.PLAUSIBLE_URL,
    PLAUSIBLE_API_KEY: process.env.PLAUSIBLE_API_KEY
  })

  if (!parsed.success) return null
  return parsed.data
}
