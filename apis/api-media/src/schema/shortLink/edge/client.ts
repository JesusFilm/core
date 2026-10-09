// Force the Cloudflare SDK onto its "web" runtime so it uses Node's native
// global fetch — same reason as schema/cloudflare/image/service.ts. This
// side-effect import MUST run before `cloudflare`.
import 'cloudflare/shims/web'

import Cloudflare from 'cloudflare'

import { readShortLinksEnv } from '../lib/env'

export interface EdgeConfig {
  accountId: string
  /** the environment-wide namespace: domain records and global links */
  globalNamespaceId: string
  client: Cloudflare
}


let cachedClient: {
  apiToken: string
  baseURL: string | null
  client: Cloudflare
} | null = null

/**
 * Edge publishing is configured by `CLOUDFLARE_SHORT_LINKS_KV_NAMESPACE_ID`
 * (the global namespace; each domain names its own on the row).
 * When it is unset (tests, local dev without the Worker) publishing is a
 * successful no-op, the same pattern as the Vercel domain calls.
 *
 * `CLOUDFLARE_SHORT_LINKS_API_BASE_URL` points the client somewhere other than
 * api.cloudflare.com. It is for local dev only: the redirect Worker's
 * `wrangler dev` serves the same endpoints over its local KV
 * (workers/short-links-redirect/README.md, "Publishing from a local api-media").
 */
export function getEdgeConfig(): EdgeConfig | null {
  const env = readShortLinksEnv()
  const globalNamespaceId = env.CLOUDFLARE_SHORT_LINKS_KV_NAMESPACE_ID
  if (globalNamespaceId == null) return null

  const accountId = env.CLOUDFLARE_ACCOUNT_ID
  const apiToken = env.CLOUDFLARE_SHORT_LINKS_API_TOKEN
  if (accountId == null || apiToken == null)
    throw new Error(
      'Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_SHORT_LINKS_API_TOKEN'
    )

  const baseURL = env.CLOUDFLARE_SHORT_LINKS_API_BASE_URL ?? null
  if (
    cachedClient == null ||
    cachedClient.apiToken !== apiToken ||
    cachedClient.baseURL !== baseURL
  )
    cachedClient = {
      apiToken,
      baseURL,
      client: new Cloudflare({ apiToken, baseURL: baseURL ?? undefined })
    }

  return {
    accountId,
    globalNamespaceId,
    client: cachedClient.client
  }
}
