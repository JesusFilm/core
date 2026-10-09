import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

const optionalString = z.string().trim().min(1).optional()

/**
 * The short-link settings api-media reads from the environment. Every one is
 * optional: a missing group switches its feature off (edge publishing, scan
 * statistics, destination-health alerts, the legacy Vercel project) rather than
 * failing boot, but a value that is present must be well formed.
 *
 * Read on each call rather than once at import so a process can be
 * reconfigured between tests; the schema is a handful of strings, so the cost
 * per read is negligible. `index.ts` reads it once at boot so a malformed
 * value fails loudly there instead of on the first request that needs it.
 */
export function readShortLinksEnv() {
  return createEnv({
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
    skipValidation: process.env.SKIP_ENV_VALIDATION === '1',
    onValidationError: (issues) => {
      throw new Error(
        `Invalid short-link environment variables: ${JSON.stringify(issues)}`
      )
    },
    server: {
      // edge publishing (Cloudflare KV); CLOUDFLARE_ACCOUNT_ID is shared with
      // the other Cloudflare integrations
      CLOUDFLARE_ACCOUNT_ID: optionalString,
      CLOUDFLARE_SHORT_LINKS_API_TOKEN: optionalString,
      CLOUDFLARE_SHORT_LINKS_KV_NAMESPACE_ID: optionalString,
      /** Local dev only: a `wrangler dev` Worker standing in for api.cloudflare.com. */
      CLOUDFLARE_SHORT_LINKS_API_BASE_URL: z.url().optional(),
      // scan statistics (ClickHouse, read side)
      SHORT_LINKS_CLICKHOUSE_URL: z.url().optional(),
      SHORT_LINKS_CLICKHOUSE_DATABASE: z
        .string()
        .trim()
        .min(1)
        .default('redirects'),
      SHORT_LINKS_CLICKHOUSE_USER: optionalString,
      SHORT_LINKS_CLICKHOUSE_PASSWORD: optionalString,
      // destination-health alerts
      SLACK_SHORT_LINKS_BOT_TOKEN: optionalString,
      SLACK_SHORT_LINKS_CHANNEL_ID: optionalString,
      // the legacy Vercel short-links project (domains created with `vercel: true`)
      VERCEL_SHORT_LINKS_PROJECT_ID: optionalString,
      VERCEL_TEAM_ID: optionalString,
      VERCEL_TOKEN: optionalString
    }
  })
}

export type ShortLinksEnv = ReturnType<typeof readShortLinksEnv>
