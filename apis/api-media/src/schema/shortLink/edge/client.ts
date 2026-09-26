// Force the Cloudflare SDK onto its "web" runtime so it uses Node's native
// global fetch — same reason as schema/cloudflare/image/service.ts. This
// side-effect import MUST run before `cloudflare`.
import 'cloudflare/shims/web'

import Cloudflare from 'cloudflare'

export interface EdgeConfig {
  accountId: string
  kvNamespaceId: string
  d1DatabaseId: string | null
  client: Cloudflare
}

function envValue(name: string): string | null {
  const value = process.env[name]
  return value == null || value === '' ? null : value
}

let cachedClient: { apiToken: string; client: Cloudflare } | null = null

/**
 * Edge publishing is configured by `CLOUDFLARE_SHORT_LINKS_KV_NAMESPACE_ID`.
 * When it is unset (local dev, tests) publishing is a successful no-op, the
 * same pattern as the Vercel domain calls. When only the D1 id is unset the
 * replica is skipped.
 */
export function getEdgeConfig(): EdgeConfig | null {
  const kvNamespaceId = envValue('CLOUDFLARE_SHORT_LINKS_KV_NAMESPACE_ID')
  if (kvNamespaceId == null) return null

  const accountId = envValue('CLOUDFLARE_ACCOUNT_ID')
  const apiToken = envValue('CLOUDFLARE_SHORT_LINKS_API_TOKEN')
  if (accountId == null || apiToken == null)
    throw new Error(
      'Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_SHORT_LINKS_API_TOKEN'
    )

  if (cachedClient == null || cachedClient.apiToken !== apiToken)
    cachedClient = { apiToken, client: new Cloudflare({ apiToken }) }

  return {
    accountId,
    kvNamespaceId,
    d1DatabaseId: envValue('CLOUDFLARE_SHORT_LINKS_D1_DATABASE_ID'),
    client: cachedClient.client
  }
}
