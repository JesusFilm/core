import { vercel } from '@t3-oss/env-core/presets-zod'
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
      .transform((val) => val === 'true')
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
    NEXT_PUBLIC_DATADOG_ENV: process.env['NEXT_PUBLIC_VERCEL_ENV'],
    NEXT_PUBLIC_DATADOG_SITE: process.env['NEXT_PUBLIC_DATADOG_SITE'],
    NEXT_PUBLIC_DATADOG_VERSION:
      process.env['NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA']
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
  emptyStringAsUndefined: true,
  extends: [vercel()]
})
