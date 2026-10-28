import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

/**
 * Validated environment. Server values are only readable on the server;
 * reading one in a client component throws, which is why `authConfig` is a
 * function (`libs/auth/config.ts`). Build and dev fail on a missing or
 * malformed value unless `SKIP_ENV_VALIDATION` is set.
 */
export const env = createEnv({
  server: {
    AUTH_SECRET: z.string().min(1),
    FIREBASE_CLIENT_EMAIL: z.string().email(),
    FIREBASE_PRIVATE_KEY: z.string().min(1)
  },
  client: {
    NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
    NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
    NEXT_PUBLIC_GATEWAY_URL: z.url(),
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: z.string().optional()
  },
  /**
   * `process.env` cannot be destructured in the edge runtime or the browser,
   * so every variable is listed by hand.
   */
  runtimeEnv: {
    AUTH_SECRET: process.env['AUTH_SECRET'],
    FIREBASE_CLIENT_EMAIL: process.env['FIREBASE_CLIENT_EMAIL'],
    FIREBASE_PRIVATE_KEY: process.env['FIREBASE_PRIVATE_KEY'],
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env['NEXT_PUBLIC_FIREBASE_API_KEY'],
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
      process.env['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'],
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:
      process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'],
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env['NEXT_PUBLIC_FIREBASE_APP_ID'],
    NEXT_PUBLIC_GATEWAY_URL: process.env['NEXT_PUBLIC_GATEWAY_URL'],
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA:
      process.env['NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA']
  },
  skipValidation: !!process.env['SKIP_ENV_VALIDATION'],
  emptyStringAsUndefined: true
})
