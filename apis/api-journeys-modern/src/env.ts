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
    CLOUDFLARE_UPLOAD_KEY: z.string().trim().min(1),
    FACEBOOK_APP_ID: z.string().trim().min(1),
    FACEBOOK_APP_SECRET: z.string().trim().min(1),
    FIREBASE_API_KEY: z.string().trim().min(1),
    GATEWAY_HMAC_SECRET: z.string().trim().min(1),
    GATEWAY_URL: z.string().trim().min(1),
    GOOGLE_CLIENT_ID: z.string().trim().min(1),
    GOOGLE_CLIENT_SECRET: z.string().trim().min(1),
    GROWTH_SPACES_URL: z.string().trim().min(1),
    INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET: z.string().trim().min(1),
    INTEROP_TOKEN: z.string().trim().min(1),
    JOURNEYS_ADMIN_URL: z.string().trim().min(1),
    JOURNEYS_REVALIDATE_ACCESS_TOKEN: z.string().trim().min(1),
    JOURNEYS_URL: z.string().trim().min(1),
    PLAUSIBLE_API_KEY: z.string().trim().min(1),
    PLAUSIBLE_URL: z.url().refine((url) => !url.endsWith('/'), {
      message: 'PLAUSIBLE_URL must not end with a trailing slash'
    }),
    REDIS_PORT: z.coerce.number().int().positive().default(6379),
    REDIS_URL: z.string().trim().min(1).default('redis'),
    SERVICE_VERSION: z.string().trim().default('')
  }
})
