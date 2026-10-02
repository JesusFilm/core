import { InfrastructureConfig } from './config'

export interface Zone {
  id: string
  name: string
}

/**
 * The Cloudflare zone a hostname belongs to, found the way wrangler does:
 * try the hostname, then drop labels from the left (`stage.jesus.film`, then
 * `jesus.film`). Null when no zone in this account matches; a zone is never
 * created here.
 */
export async function findZone(
  config: InfrastructureConfig,
  hostname: string
): Promise<Zone | null> {
  const labels = hostname.toLowerCase().split('.')
  for (let start = 0; start <= labels.length - 2; start++) {
    const name = labels.slice(start).join('.')
    for await (const zone of config.client.zones.list({
      name,
      account: { id: config.accountId }
    })) {
      return { id: zone.id, name: zone.name }
    }
  }
  return null
}
