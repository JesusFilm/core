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
 */
export async function kvWrite(
  config: EdgeConfig,
  record: EdgeRecord
): Promise<void> {
  await config.client.kv.namespaces.values.update(
    config.kvNamespaceId,
    record.key,
    { account_id: config.accountId, value: record.value, metadata: '{}' }
  )
}

export async function kvDelete(config: EdgeConfig, key: string): Promise<void> {
  await config.client.kv.namespaces.values.delete(config.kvNamespaceId, key, {
    account_id: config.accountId
  })
}

export async function kvWriteMany(
  config: EdgeConfig,
  records: EdgeRecord[]
): Promise<void> {
  for (const batch of chunk(records, KV_BULK_CHUNK)) {
    await config.client.kv.namespaces.bulkUpdate(config.kvNamespaceId, {
      account_id: config.accountId,
      body: batch.map(({ key, value }) => ({ key, value }))
    })
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
