import { Logger } from 'pino'

import { Prisma, prisma } from '@core/prisma/media/client'

import { logger as defaultLogger } from '../../../logger'

import { getEdgeConfig } from './client'
import {
  buildDomainRecord,
  buildRoutingRecord,
  domainKey,
  isLiveLink,
  recordKeyForLink
} from './records'
import { d1Delete, d1Upsert, kvDelete, kvWrite, kvWriteMany } from './store'

type Db = Prisma.TransactionClient

const linkInclude = {
  domain: true,
  campaigns: { select: { id: true } }
} satisfies Prisma.ShortLinkInclude

/**
 * Write the domain record. Call inside the mutation's transaction so a KV
 * rejection rolls the Postgres write back.
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
  await kvWrite(config, record)
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
  await kvDelete(config, key)
  await d1Delete(config, key, logger)
}

/**
 * Write (or, for a deleted / retired link, remove) one routing record and
 * stamp `edgePublishedAt`.
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
  const key = recordKeyForLink(link, link.domain)

  if (!isLiveLink(link)) {
    await kvDelete(config, key)
    await d1Delete(config, key, logger)
  } else {
    const record = {
      key,
      value: JSON.stringify(buildRoutingRecord(link, link.domain))
    }
    await kvWrite(config, record)
    await d1Upsert(config, [record], logger)
  }

  const edgePublishedAt = new Date()
  await db.shortLink.update({
    where: { id: linkId },
    data: { edgePublishedAt }
  })
  return edgePublishedAt
}

/** Remove a link's routing record from KV and D1 (soft delete / retire). */
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
    include: { domain: true }
  })
  const key = recordKeyForLink(link, link.domain)
  await kvDelete(config, key)
  await d1Delete(config, key, logger)
}

const DOMAIN_LINK_BATCH = 1000

/**
 * Republish the domain record and every live link on it — backfill, cutover,
 * and publish-gap repair. Uses the KV bulk endpoint so a domain with tens of
 * thousands of links stays within the API rate limits.
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

    const records = links.map((link) => ({
      key: recordKeyForLink(link, domain),
      value: JSON.stringify(buildRoutingRecord(link, domain))
    }))
    await kvWriteMany(config, records)
    await d1Upsert(config, records, logger)
    await db.shortLink.updateMany({
      where: { id: { in: links.map(({ id }) => id) } },
      data: { edgePublishedAt: edgePublishedAt ?? new Date() }
    })

    published += links.length
    cursor = links[links.length - 1].id
    if (links.length < DOMAIN_LINK_BATCH) break
  }

  logger.info(
    { domainId, hostname: domain.hostname, published },
    'short link edge: domain published'
  )
  return edgePublishedAt
}
