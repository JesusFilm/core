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
    GOOGLE_CLIENT_SECRET: z.string().trim().min(1),

    // General
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),

    // Gateway / interop
    GATEWAY_HMAC_SECRET: z.string().trim().min(1),
    GATEWAY_URL: z.string().trim().min(1),
    INTEROP_TOKEN: z.string().trim().min(1),
    SERVICE_VERSION: z.string().optional(),

    // Journeys URLs / tokens
    JOURNEYS_ADMIN_URL: z.string().trim().min(1),
    JOURNEYS_URL: z.string().trim().min(1),
    JOURNEYS_REVALIDATE_ACCESS_TOKEN: z.string().trim().min(1),

    // Facebook integration
    FACEBOOK_APP_ID: z.string().trim().min(1),
    FACEBOOK_APP_SECRET: z.string().trim().min(1),

    // Firebase
    FIREBASE_API_KEY: z.string().trim().min(1),

    // Growth Spaces integration
    GROWTH_SPACES_URL: z.string().trim().min(1),

    // Redis
    REDIS_URL: z.string().trim().min(1).default('redis'),
    REDIS_PORT: z.coerce.number().int().positive().default(6379),

    // Cloudflare
    CLOUDFLARE_UPLOAD_KEY: z.string().trim().min(1)
  }
})
