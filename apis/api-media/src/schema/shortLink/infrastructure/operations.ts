import { Logger } from 'pino'

import { ShortLinkDomain, prisma } from '@core/prisma/media/client'

import { logger as defaultLogger } from '../../../logger'
import { NotFoundError } from '../../error'
import {
  domainLinkKey,
  getEdgeConfig,
  publishDomain,
  publishDomainWithLinks
} from '../edge'
import { failedPrecondition } from '../lib/errors'

import {
  createAttachment,
  deleteAttachment,
  listAttachments,
  matchesTarget
} from './attachments'
import {
  InfrastructureConfig,
  assertHostnameAllowed,
  requireInfrastructureConfig
} from './config'
import { withWorkerBindingsLock } from './lock'
import { attachmentTarget, kvBindingName, namespaceTitle } from './names'
import {
  createNamespace,
  findNamespaceByTitle,
  getNamespace,
  pruneNamespace
} from './namespaces'
import { removeWorkerKvBindings, setWorkerKvBinding } from './workerBindings'
import { Zone, findZone } from './zones'

async function findDomain(domainId: string): Promise<ShortLinkDomain> {
  const domain = await prisma.shortLinkDomain.findUnique({
    where: { id: domainId }
  })
  if (domain == null)
    throw new NotFoundError('short link domain not found', [
      { path: ['id'], value: domainId }
    ])
  return domain
}

async function requireZone(
  config: InfrastructureConfig,
  hostname: string
): Promise<Zone> {
  const zone = await findZone(config, hostname)
  if (zone == null)
    throw failedPrecondition(
      `no zone for ${hostname} in this Cloudflare account; add the zone in Cloudflare first`
    )
  return zone
}

/** The keys the domain's namespace should hold: its live links' slugs. */
async function liveLinkKeys(domain: ShortLinkDomain): Promise<Set<string>> {
  const links = await prisma.shortLink.findMany({
    where: {
      domainId: domain.id,
      deletedAt: null,
      status: { not: 'retired' }
    },
    select: { pathname: true }
  })
  return new Set(links.map((link) => domainLinkKey(link, domain)))
}

/**
 * Create (or adopt) the domain's KV namespace, fill it, bind it to the Worker
 * and only then tell the Worker to read it. Ordered so redirects keep working
 * if any step fails: until the last step the Worker serves the domain from the
 * global namespace and api-media, exactly as before. Safe to run again.
 */
export async function setupDomainKv(
  domainId: string,
  logger: Logger = defaultLogger
): Promise<void> {
  const config = requireInfrastructureConfig()
  if (getEdgeConfig() == null)
    throw failedPrecondition(
      'edge publishing is not configured in this environment'
    )
  const domain = await findDomain(domainId)
  assertHostnameAllowed(config, domain.hostname)

  const binding = domain.kvBinding ?? kvBindingName(domain.hostname)
  const bindingOwner = await prisma.shortLinkDomain.findFirst({
    where: { kvBinding: binding, id: { not: domainId } },
    select: { hostname: true }
  })
  if (bindingOwner != null)
    throw failedPrecondition(
      `Worker binding ${binding} is already used by ${bindingOwner.hostname}`
    )

  const title = namespaceTitle(config.workerName, domain.hostname)
  const existing =
    (domain.kvNamespaceId != null
      ? await getNamespace(config, domain.kvNamespaceId)
      : null) ?? (await findNamespaceByTitle(config, title))
  const namespace = existing ?? (await createNamespace(config, title))

  if (domain.kvNamespaceId !== namespace.id)
    await prisma.shortLinkDomain.update({
      where: { id: domainId },
      data: { kvNamespaceId: namespace.id }
    })
  await publishDomainWithLinks(domainId, prisma, logger)
  const pruned =
    existing == null
      ? 0
      : await pruneNamespace(config, namespace.id, await liveLinkKeys(domain))

  await withWorkerBindingsLock(
    async () => await setWorkerKvBinding(config, binding, namespace.id, logger)
  )

  if (domain.kvBinding !== binding)
    await prisma.shortLinkDomain.update({
      where: { id: domainId },
      data: { kvBinding: binding }
    })
  await publishDomain(domainId, prisma, logger)

  logger.info(
    {
      domainId,
      hostname: domain.hostname,
      namespaceId: namespace.id,
      binding,
      createdNamespace: existing == null,
      pruned
    },
    'short link infrastructure: domain KV set up'
  )
}

/**
 * Take the domain off its own namespace: stop the Worker reading it, remove
 * the binding and clear the row. The namespace itself is left in Cloudflare
 * (it is adopted, and pruned, by the next setup). Refused while
 * the hostname is attached, because the domain's links would then only
 * resolve through api-media. Safe to run again after a partial failure.
 */
export async function removeDomainKv(
  domainId: string,
  logger: Logger = defaultLogger
): Promise<void> {
  const config = requireInfrastructureConfig()
  const domain = await findDomain(domainId)

  const zone = await findZone(config, domain.hostname)
  if (zone != null) {
    const target = attachmentTarget(domain)
    const attachments = await listAttachments(config, zone, target.hostname)
    if (attachments.some(({ script }) => script === config.workerName))
      throw failedPrecondition(
        `detach ${domain.hostname} from ${config.workerName} before removing its KV setup`
      )
  }

  if (domain.kvBinding != null) {
    await prisma.shortLinkDomain.update({
      where: { id: domainId },
      data: { kvBinding: null }
    })
    await publishDomain(domainId, prisma, logger)
  }

  // by name, and by namespace so a retry (kvBinding already cleared) still
  // finds the binding
  const removed = await withWorkerBindingsLock(
    async () =>
      await removeWorkerKvBindings(
        config,
        ({ name, namespace_id: namespaceId }) =>
          name === domain.kvBinding ||
          (domain.kvNamespaceId != null &&
            namespaceId === domain.kvNamespaceId),
        logger
      )
  )

  if (domain.kvNamespaceId != null)
    await prisma.shortLinkDomain.update({
      where: { id: domainId },
      data: { kvNamespaceId: null }
    })

  logger.info(
    { domainId, hostname: domain.hostname, removed },
    'short link infrastructure: domain KV removed'
  )
}

/**
 * Point the hostname at the Worker. Never takes a hostname over: one that
 * already points at another Worker is refused, and no DNS override is sent.
 */
export async function attachDomain(
  domainId: string,
  logger: Logger = defaultLogger
): Promise<void> {
  const config = requireInfrastructureConfig()
  const domain = await findDomain(domainId)
  assertHostnameAllowed(config, domain.hostname)
  if (domain.kvNamespaceId == null || domain.kvBinding == null)
    throw failedPrecondition(
      `set up KV for ${domain.hostname} before attaching it to the Worker`
    )

  const zone = await requireZone(config, domain.hostname)
  const target = attachmentTarget(domain)
  const attachments = await listAttachments(config, zone, target.hostname)
  const existing = attachments.find((attachment) =>
    matchesTarget(attachment, target)
  )
  if (existing?.script === config.workerName) return
  if (existing != null)
    throw failedPrecondition(
      `${target.pattern} is already attached to ${existing.script ?? 'a route with no Worker'}; detach it there first`
    )

  await createAttachment(config, zone, target)
  logger.info(
    {
      domainId,
      hostname: domain.hostname,
      kind: target.kind,
      pattern: target.pattern,
      workerName: config.workerName
    },
    'short link infrastructure: domain attached'
  )
}

/** Removes only what points at this Worker; anything else on the hostname is left alone. */
export async function detachDomain(
  domainId: string,
  logger: Logger = defaultLogger
): Promise<void> {
  const config = requireInfrastructureConfig()
  const domain = await findDomain(domainId)

  const zone = await requireZone(config, domain.hostname)
  const target = attachmentTarget(domain)
  const attachments = await listAttachments(config, zone, target.hostname)
  const ours = attachments.filter(({ script }) => script === config.workerName)

  for (const attachment of ours)
    await deleteAttachment(config, zone, attachment)
  logger.info(
    {
      domainId,
      hostname: domain.hostname,
      detached: ours.map(({ pattern }) => pattern),
      workerName: config.workerName
    },
    'short link infrastructure: domain detached'
  )
}
