import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    CI: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
    VERCEL: z.string().optional(),
    VERCEL_ENV: z
      .enum(['development', 'preview', 'production', 'stage', 'prod'])
      .optional(),
    VERCEL_URL: z.string().optional(),
    VERCEL_GIT_COMMIT_SHA: z.string().optional()
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_GATEWAY_URL: z.url(),
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: z.string().optional(),
    NEXT_PUBLIC_MUX_DEFAULT_REPORTING_KEY: z.string().optional()
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    CI: process?.env?.['CI'],
    NEXT_PUBLIC_GATEWAY_URL:
      process.env?.['NEXT_PUBLIC_GATEWAY_URL'] || 'http://127.0.0.1:4000',
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: process.env?.['VERCEL_GIT_COMMIT_SHA'],
    NEXT_PUBLIC_MUX_DEFAULT_REPORTING_KEY:
      process.env?.['NEXT_PUBLIC_MUX_DEFAULT_REPORTING_KEY'],
    VERCEL: process.env?.['VERCEL'],
    VERCEL_ENV: process.env?.['VERCEL_ENV'],
    VERCEL_URL: process.env?.['VERCEL_URL'],
    VERCEL_GIT_COMMIT_SHA: process.env?.['VERCEL_GIT_COMMIT_SHA']
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env?.['SKIP_ENV_VALIDATION'],
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true
})
