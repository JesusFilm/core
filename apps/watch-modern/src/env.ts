import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    ANALYZE: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
    CI: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
    VERCEL: z.string().optional(),
    VERCEL_ENV: z
      .enum(['development', 'preview', 'production', 'stage', 'prod'])
      .optional(),
    VERCEL_URL: z.string().optional(),
    VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
    VERCEL_BRANCH_URL: z.string().optional(),
    VERCEL_REGION: z.string().optional(),
    VERCEL_DEPLOYMENT_ID: z.string().optional(),
    VERCEL_SKEW_PROTECTION_ENABLED: z.string().optional(),
    VERCEL_AUTOMATION_BYPASS_SECRET: z.string().optional(),
    VERCEL_GIT_PROVIDER: z.string().optional(),
    VERCEL_GIT_REPO_SLUG: z.string().optional(),
    VERCEL_GIT_REPO_OWNER: z.string().optional(),
    VERCEL_GIT_REPO_ID: z.string().optional(),
    VERCEL_GIT_COMMIT_REF: z.string().optional(),
    VERCEL_GIT_COMMIT_SHA: z.string().optional(),
    VERCEL_GIT_COMMIT_MESSAGE: z.string().optional(),
    VERCEL_GIT_COMMIT_AUTHOR_LOGIN: z.string().optional(),
    VERCEL_GIT_COMMIT_AUTHOR_NAME: z.string().optional(),
    VERCEL_GIT_PREVIOUS_SHA: z.string().optional(),
    VERCEL_GIT_PULL_REQUEST_ID: z.string().optional()
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE: z.string(),
    NEXT_PUBLIC_DATADOG_APPLICATION_ID: z.string().optional(),
    NEXT_PUBLIC_DATADOG_CLIENT_TOKEN: z.string().optional(),
    NEXT_PUBLIC_DATADOG_ENV: z.string().default('development'),
    NEXT_PUBLIC_DATADOG_SITE: z
      .enum([
        'datadoghq.com',
        'us3.datadoghq.com',
        'us5.datadoghq.com',
        'datadoghq.eu',
        'ddog-gov.com',
        'ap1.datadoghq.com',
        'ap2.datadoghq.com'
      ])
      .default('datadoghq.com'),
    NEXT_PUBLIC_DATADOG_VERSION: z.string().optional()
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    ANALYZE: process.env['ANALYZE'],
    CI: process.env['CI'],
    NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE:
      process.env['NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE'],
    NEXT_PUBLIC_DATADOG_APPLICATION_ID:
      process.env['NEXT_PUBLIC_DATADOG_APPLICATION_ID'],
    NEXT_PUBLIC_DATADOG_CLIENT_TOKEN:
      process.env['NEXT_PUBLIC_DATADOG_CLIENT_TOKEN'],
    NEXT_PUBLIC_DATADOG_ENV: process.env['VERCEL_ENV'],
    NEXT_PUBLIC_DATADOG_SITE: process.env['NEXT_PUBLIC_DATADOG_SITE'],
    NEXT_PUBLIC_DATADOG_VERSION: process.env['VERCEL_GIT_COMMIT_SHA'],
    VERCEL: process.env['VERCEL'],
    VERCEL_ENV: process.env['VERCEL_ENV'],
    VERCEL_URL: process.env['VERCEL_URL'],
    VERCEL_PROJECT_PRODUCTION_URL: process.env['VERCEL_PROJECT_PRODUCTION_URL'],
    VERCEL_BRANCH_URL: process.env['VERCEL_BRANCH_URL'],
    VERCEL_REGION: process.env['VERCEL_REGION'],
    VERCEL_DEPLOYMENT_ID: process.env['VERCEL_DEPLOYMENT_ID'],
    VERCEL_SKEW_PROTECTION_ENABLED:
      process.env['VERCEL_SKEW_PROTECTION_ENABLED'],
    VERCEL_AUTOMATION_BYPASS_SECRET:
      process.env['VERCEL_AUTOMATION_BYPASS_SECRET'],
    VERCEL_GIT_PROVIDER: process.env['VERCEL_GIT_PROVIDER'],
    VERCEL_GIT_REPO_SLUG: process.env['VERCEL_GIT_REPO_SLUG'],
    VERCEL_GIT_REPO_OWNER: process.env['VERCEL_GIT_REPO_OWNER'],
    VERCEL_GIT_REPO_ID: process.env['VERCEL_GIT_REPO_ID'],
    VERCEL_GIT_COMMIT_REF: process.env['VERCEL_GIT_COMMIT_REF'],
    VERCEL_GIT_COMMIT_SHA: process.env['VERCEL_GIT_COMMIT_SHA'],
    VERCEL_GIT_COMMIT_MESSAGE: process.env['VERCEL_GIT_COMMIT_MESSAGE'],
    VERCEL_GIT_COMMIT_AUTHOR_LOGIN:
      process.env['VERCEL_GIT_COMMIT_AUTHOR_LOGIN'],
    VERCEL_GIT_COMMIT_AUTHOR_NAME: process.env['VERCEL_GIT_COMMIT_AUTHOR_NAME'],
    VERCEL_GIT_PREVIOUS_SHA: process.env['VERCEL_GIT_PREVIOUS_SHA'],
    VERCEL_GIT_PULL_REQUEST_ID: process.env['VERCEL_GIT_PULL_REQUEST_ID']
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env['SKIP_ENV_VALIDATION'],
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true
})
