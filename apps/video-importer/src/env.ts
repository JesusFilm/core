import 'dotenv/config'

import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  runtimeEnv: process.env,
  skipValidation: process.env.SKIP_ENV_VALIDATION === '1',
  onValidationError: (issues) => {
    console.error('[video-importer] ❌ Invalid environment variables:', issues)
    throw new Error('[video-importer] Invalid environment variables')
  },
  server: {
    GRAPHQL_ENDPOINT: z.url().trim().min(1),
    FIREBASE_EMAIL: z.string().trim().min(1),
    FIREBASE_PASSWORD: z.string().trim().min(1),
    FIREBASE_API_KEY: z.string().trim().min(1),
    FIREBASE_AUTH_DOMAIN: z.string().trim().min(1),
    FIREBASE_PROJECT_ID: z.string().trim().min(1),
    FIREBASE_APP_ID: z.string().trim().min(1),

    CLOUDFLARE_R2_ENDPOINT: z.url().trim().min(1),
    CLOUDFLARE_R2_ACCESS_KEY_ID: z.string().trim().min(1),
    CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string().trim().min(1),
    CLOUDFLARE_R2_BUCKET: z.string().trim().min(1),
    CLOUDFLARE_R2_CUSTOM_DOMAIN: z.url().trim().min(1),

    SLACK_BOT_TOKEN: z.string().trim().min(1),
    SLACK_CHANNEL_ID: z.string().trim().min(1)
  }
})
