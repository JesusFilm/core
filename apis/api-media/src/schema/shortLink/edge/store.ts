import { Logger } from 'pino'

import { logger as defaultLogger } from '../../../logger'

import { EdgeConfig } from './client'

export interface EdgeRecord {
  key: string
  value: string
}

// KV bulk writes accept up to 10,000 pairs; D1 binds at most 100 parameters
// per statement (3 per record).
const KV_BULK_CHUNK = 1000
const D1_ROWS_PER_STATEMENT = 30

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let index = 0; index < items.length; index += size)
    chunks.push(items.slice(index, index + size))
  return chunks
}

/**
 * KV is the primary store: a failure here is thrown so the surrounding
 * transaction rolls back and the mutation fails.
 *
 * A single record goes through the bulk endpoint too. The SDK's
 * `values.update` sends `{ value, metadata }` as a JSON body, which Cloudflare
 * stores verbatim as the value (cloudflare-typescript#2593), so the Worker
 * would read a wrapper instead of a record.
 */
export async function kvWrite(
  config: EdgeConfig,
  namespaceId: string,
  record: EdgeRecord
): Promise<void> {
  await kvWriteMany(config, namespaceId, [record])
}

export async function kvDelete(
  config: EdgeConfig,
  namespaceId: string,
  key: string
): Promise<void> {
  await config.client.kv.namespaces.values.delete(namespaceId, key, {
    account_id: config.accountId
  })
}

export async function kvWriteMany(
  config: EdgeConfig,
  namespaceId: string,
  records: EdgeRecord[]
): Promise<void> {
  for (const batch of chunk(records, KV_BULK_CHUNK)) {
    const result = await config.client.kv.namespaces.bulkUpdate(namespaceId, {
      account_id: config.accountId,
      body: batch.map(({ key, value }) => ({ key, value }))
    })
    // the bulk endpoint answers 200 even when some keys were not written
    const unsuccessfulKeys = result?.unsuccessful_keys ?? []
    if (unsuccessfulKeys.length > 0)
      throw new Error(
        `short link edge: KV did not write ${unsuccessfulKeys.length} key(s): ${unsuccessfulKeys.slice(0, 5).join(', ')}`
      )
  }
}

/**
 * D1 is the replica: failures are logged and swallowed so a D1 outage never
 * blocks a write that KV accepted.
 */
async function d1Query(
  config: EdgeConfig,
  sql: string,
  params: string[],
  logger: Logger
): Promise<void> {
  if (config.d1DatabaseId == null) return
  try {
    await config.client.d1.database.query(config.d1DatabaseId, {
      account_id: config.accountId,
      sql,
      params
    })
  } catch (error) {
    logger.error({ error, sql }, 'short link edge: D1 write failed')
  }
}

export async function d1Upsert(
  config: EdgeConfig,
  records: EdgeRecord[],
  logger: Logger = defaultLogger
): Promise<void> {
  if (records.length === 0) return
  const updatedAt = new Date().toISOString()
  for (const batch of chunk(records, D1_ROWS_PER_STATEMENT)) {
    const placeholders = batch.map(() => '(?, ?, ?)').join(', ')
    const sql = `INSERT INTO short_link_records (key, value, updated_at) VALUES ${placeholders} ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
    const params = batch.flatMap(({ key, value }) => [key, value, updatedAt])
    await d1Query(config, sql, params, logger)
  }
}

/**
 * Deletes every `link:<hostname>/…` row. Unlike the other D1 writes this
 * throws: it runs when a domain's KV setup is removed, after which nothing
 * republishes those rows, so a row left behind would be served stale.
 */
export async function d1DeleteDomainLinks(
  config: EdgeConfig,
  hostname: string
): Promise<void> {
  if (config.d1DatabaseId == null) return
  const prefix = `link:${hostname.toLowerCase()}/`
  await config.client.d1.database.query(config.d1DatabaseId, {
    account_id: config.accountId,
    // '0' is the character after '/', so this is every key with the prefix
    sql: 'DELETE FROM short_link_records WHERE key >= ? AND key < ?',
    params: [prefix, `${prefix.slice(0, -1)}0`]
  })
}

export async function d1Delete(
  config: EdgeConfig,
  key: string,
  logger: Logger = defaultLogger
): Promise<void> {
  await d1Query(
    config,
    'DELETE FROM short_link_records WHERE key = ?',
    [key],
    logger
  )
}
