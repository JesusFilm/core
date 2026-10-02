import { Logger } from 'pino'

import { Prisma, prisma } from '@core/prisma/media/client'

import { logger as defaultLogger } from '../../../logger'

import { getEdgeConfig } from './client'
import {
  buildDomainRecord,
  buildRoutingRecord,
  domainKey,
  domainLinkKey,
  globalLinkKey,
  globalRecordKeyForLink,
  isLiveLink,
  recordKeyForLink
} from './records'
import {
  EdgeRecord,
  d1Delete,
  d1DeleteDomainLinks,
  d1Upsert,
  kvDelete,
  kvWrite,
  kvWriteMany
} from './store'

type Db = Prisma.TransactionClient

const linkInclude = {
  domain: true,
  campaigns: { select: { id: true } },
  // the registry row this link owns (null when it never claimed its pathname
  // or released it); only the owner may touch the global key
  globalSlug: { select: { pathname: true } }
} satisfies Prisma.ShortLinkInclude

/**
 * Write the domain record to the global namespace (and D1). Call inside the
 * mutation's transaction so a KV rejection rolls the Postgres write back.
 */
export async function publishDomain(
  domainId: string,
  db: Db = prisma,
  logger: Logger = defaultLogger
): Promise<Date | null> {
  const config = getEdgeConfig()
  if (config == null) {
    logger.debug({ domainId }, 'short link edge: publishing disabled')
    return null
  }

  const domain = await db.shortLinkDomain.findUniqueOrThrow({
    where: { id: domainId }
  })
  const record = {
    key: domainKey(domain.hostname),
    value: JSON.stringify(buildDomainRecord(domain))
  }
  await kvWrite(config, config.globalNamespaceId, record)
  await d1Upsert(config, [record], logger)

  const edgePublishedAt = new Date()
  await db.shortLinkDomain.update({
    where: { id: domainId },
    data: { edgePublishedAt }
  })
  return edgePublishedAt
}

export async function unpublishDomain(
  hostname: string,
  logger: Logger = defaultLogger
): Promise<void> {
  const config = getEdgeConfig()
  if (config == null) {
    logger.debug({ hostname }, 'short link edge: publishing disabled')
    return
  }
  const key = domainKey(hostname)
  await kvDelete(config, config.globalNamespaceId, key)
  await d1Delete(config, key, logger)
}

/**
 * Write (or, for a deleted / retired / un-flagged link, remove) the routing
 * record in the domain's namespace and, for global links, the global
 * namespace; stamp `edgePublishedAt`. Returns null when nothing applies (the
 * domain has no namespace and the link is not global).
 */
export async function publishLink(
  linkId: string,
  db: Db = prisma,
  logger: Logger = defaultLogger
): Promise<Date | null> {
  const config = getEdgeConfig()
  if (config == null) {
    logger.debug({ linkId }, 'short link edge: publishing disabled')
    return null
  }

  const link = await db.shortLink.findUniqueOrThrow({
    where: { id: linkId },
    include: linkInclude
  })
  const live = isLiveLink(link)
  const ownsGlobalClaim = link.globalSlug != null
  const domainNamespaceId = link.domain.kvNamespaceId
  const value = JSON.stringify(buildRoutingRecord(link, link.domain))
  let published = false

  if (domainNamespaceId != null) {
    const key = domainLinkKey(link, link.domain)
    const replicaKey = recordKeyForLink(link, link.domain)
    if (live) {
      await kvWrite(config, domainNamespaceId, { key, value })
      await d1Upsert(config, [{ key: replicaKey, value }], logger)
    } else {
      await kvDelete(config, domainNamespaceId, key)
      await d1Delete(config, replicaKey, logger)
    }
    published = true
  }

  if (live && link.global) {
    await kvWrite(config, config.globalNamespaceId, {
      key: globalLinkKey(link),
      value
    })
    await d1Upsert(
      config,
      [{ key: globalRecordKeyForLink(link), value }],
      logger
    )
    published = true
  } else if (ownsGlobalClaim) {
    await kvDelete(config, config.globalNamespaceId, globalLinkKey(link))
    await d1Delete(config, globalRecordKeyForLink(link), logger)
    published = true
  }

  if (!published) {
    logger.debug(
      { linkId, hostname: link.domain.hostname },
      'short link edge: domain has no namespace and link is not global; skipped'
    )
    return null
  }

  const edgePublishedAt = new Date()
  await db.shortLink.update({
    where: { id: linkId },
    data: { edgePublishedAt }
  })
  return edgePublishedAt
}

/**
 * Remove a link's routing records from the domain namespace, the global
 * namespace (when this link owns the global pathname) and D1.
 */
export async function unpublishLink(
  linkId: string,
  db: Db = prisma,
  logger: Logger = defaultLogger
): Promise<void> {
  const config = getEdgeConfig()
  if (config == null) {
    logger.debug({ linkId }, 'short link edge: publishing disabled')
    return
  }

  const link = await db.shortLink.findUniqueOrThrow({
    where: { id: linkId },
    include: { domain: true, globalSlug: { select: { pathname: true } } }
  })
  if (link.domain.kvNamespaceId != null) {
    await kvDelete(
      config,
      link.domain.kvNamespaceId,
      domainLinkKey(link, link.domain)
    )
    await d1Delete(config, recordKeyForLink(link, link.domain), logger)
  }
  if (link.globalSlug != null) {
    await kvDelete(config, config.globalNamespaceId, globalLinkKey(link))
    await d1Delete(config, globalRecordKeyForLink(link), logger)
  }
}

/**
 * Drop a domain's link rows from the D1 replica (when its KV setup is removed
 * the links stop being published, so the replica must not keep serving them).
 * Global links keep their `global:<pathname>` rows.
 */
export async function purgeDomainLinkReplica(hostname: string): Promise<void> {
  const config = getEdgeConfig()
  if (config == null) return
  await d1DeleteDomainLinks(config, hostname)
}

const DOMAIN_LINK_BATCH = 1000

/**
 * Republish the domain record, every live link into the domain's namespace
 * (when it has one), and the global keys of its global links — backfill,
 * cutover, and publish-gap repair. Uses the KV bulk endpoint so a domain with
 * tens of thousands of links stays within the API rate limits.
 */
export async function publishDomainWithLinks(
  domainId: string,
  db: Db = prisma,
  logger: Logger = defaultLogger
): Promise<Date | null> {
  const config = getEdgeConfig()
  if (config == null) {
    logger.debug({ domainId }, 'short link edge: publishing disabled')
    return null
  }

  const edgePublishedAt = await publishDomain(domainId, db, logger)
  const domain = await db.shortLinkDomain.findUniqueOrThrow({
    where: { id: domainId }
  })
  const domainNamespaceId = domain.kvNamespaceId

  let cursor: string | undefined
  let published = 0
  while (true) {
    const links = await db.shortLink.findMany({
      where: { domainId, deletedAt: null, status: { not: 'retired' } },
      include: { campaigns: { select: { id: true } } },
      orderBy: { id: 'asc' },
      take: DOMAIN_LINK_BATCH,
      ...(cursor != null ? { cursor: { id: cursor }, skip: 1 } : {})
    })
    if (links.length === 0) break

    const replicaRecords: EdgeRecord[] = []
    const publishedIds: string[] = []

    if (domainNamespaceId != null) {
      const records = links.map((link) => ({
        key: domainLinkKey(link, domain),
        value: JSON.stringify(buildRoutingRecord(link, domain))
      }))
      await kvWriteMany(config, domainNamespaceId, records)
      replicaRecords.push(
        ...links.map((link, index) => ({
          key: recordKeyForLink(link, domain),
          value: records[index].value
        }))
      )
      publishedIds.push(...links.map(({ id }) => id))
    }

    const globalLinks = links.filter((link) => link.global)
    if (globalLinks.length > 0) {
      const records = globalLinks.map((link) => ({
        key: globalLinkKey(link),
        value: JSON.stringify(buildRoutingRecord(link, domain))
      }))
      await kvWriteMany(config, config.globalNamespaceId, records)
      replicaRecords.push(
        ...globalLinks.map((link, index) => ({
          key: globalRecordKeyForLink(link),
          value: records[index].value
        }))
      )
      if (domainNamespaceId == null)
        publishedIds.push(...globalLinks.map(({ id }) => id))
    }

    await d1Upsert(config, replicaRecords, logger)
    if (publishedIds.length > 0)
      await db.shortLink.updateMany({
        where: { id: { in: publishedIds } },
        data: { edgePublishedAt: edgePublishedAt ?? new Date() }
      })

    published += publishedIds.length
    cursor = links[links.length - 1].id
    if (links.length < DOMAIN_LINK_BATCH) break
  }

  logger.info(
    {
      domainId,
      hostname: domain.hostname,
      published,
      domainNamespace: domainNamespaceId != null
    },
    'short link edge: domain published'
  )
  return edgePublishedAt
}
