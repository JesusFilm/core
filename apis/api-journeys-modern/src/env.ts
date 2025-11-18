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
