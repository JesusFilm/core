import { EdgeConfig } from './client'

export interface EdgeRecord {
  key: string
  value: string
}

// KV bulk writes accept up to 10,000 pairs
const KV_BULK_CHUNK = 1000

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
