import { InfrastructureConfig } from './config'
import { AttachmentTarget } from './names'
import { Zone } from './zones'

export interface Attachment {
  kind: AttachmentTarget['kind']
  id: string
  /** the route pattern, or the hostname of a custom domain */
  pattern: string
  /** the Worker it points at; null for a route that disables Workers */
  script: string | null
}

function routeIsOnHostname(pattern: string, hostname: string): boolean {
  return pattern === hostname || pattern.startsWith(`${hostname}/`)
}

/** Every route and custom domain on this exact hostname, whichever Worker it points at. */
export async function listAttachments(
  config: InfrastructureConfig,
  zone: Zone,
  hostname: string
): Promise<Attachment[]> {
  const attachments: Attachment[] = []

  for await (const route of config.client.workers.routes.list({
    zone_id: zone.id
  })) {
    if (routeIsOnHostname(route.pattern, hostname))
      attachments.push({
        kind: 'route',
        id: route.id,
        pattern: route.pattern,
        script: route.script === '' ? null : (route.script ?? null)
      })
  }

  for await (const domain of config.client.workers.domains.list({
    account_id: config.accountId,
    hostname
  })) {
    if (domain.id != null && domain.hostname === hostname)
      attachments.push({
        kind: 'customDomain',
        id: domain.id,
        pattern: hostname,
        script: domain.service ?? null
      })
  }

  return attachments
}

export function matchesTarget(
  attachment: Attachment,
  target: AttachmentTarget
): boolean {
  return (
    attachment.kind === target.kind && attachment.pattern === target.pattern
  )
}

/**
 * A custom domain makes Cloudflare create the DNS record and certificate, and
 * is refused by Cloudflare when the hostname already has DNS records (no
 * override is ever sent). A route needs the hostname to already have a proxied
 * DNS record; DNS is never edited here.
 */
export async function createAttachment(
  config: InfrastructureConfig,
  zone: Zone,
  target: AttachmentTarget
): Promise<void> {
  if (target.kind === 'route') {
    await config.client.workers.routes.create({
      zone_id: zone.id,
      pattern: target.pattern,
      script: config.workerName
    })
    return
  }
  await config.client.workers.domains.update({
    account_id: config.accountId,
    environment: 'production',
    hostname: target.hostname,
    service: config.workerName,
    zone_id: zone.id
  })
}

export async function deleteAttachment(
  config: InfrastructureConfig,
  zone: Zone,
  attachment: Attachment
): Promise<void> {
  if (attachment.kind === 'route') {
    await config.client.workers.routes.delete(attachment.id, {
      zone_id: zone.id
    })
    return
  }
  await config.client.workers.domains.delete(attachment.id, {
    account_id: config.accountId
  })
}
