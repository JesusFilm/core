import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  runtimeEnv: process.env,
  skipValidation: process.env.SKIP_ENV_VALIDATION === '1',
  emptyStringAsUndefined: true,
  onValidationError: (issues) => {
    console.error('[scribe] ❌ Invalid environment variables:', issues)
    throw new Error('[scribe] Invalid environment variables')
  },
  server: {
    SCRIBE_CONFIG_DIR: z.string().trim().min(1).optional()
  }
})
