import { InfrastructureConfig } from './config'
import { isCloudflareNotFound } from './errors'

export interface KvNamespace {
  id: string
  title: string
}

// the KV bulk delete endpoint accepts up to 10,000 keys
const BULK_DELETE_CHUNK = 10_000

/** Null when Cloudflare has no namespace with this id (it was deleted by hand). */
export async function getNamespace(
  config: InfrastructureConfig,
  namespaceId: string
): Promise<KvNamespace | null> {
  try {
    const { id, title } = await config.client.kv.namespaces.get(namespaceId, {
      account_id: config.accountId
    })
    return { id, title }
  } catch (error) {
    if (isCloudflareNotFound(error)) return null
    throw error
  }
}

/** The list endpoint has no title filter, so this pages through and matches. */
export async function findNamespaceByTitle(
  config: InfrastructureConfig,
  title: string
): Promise<KvNamespace | null> {
  for await (const namespace of config.client.kv.namespaces.list({
    account_id: config.accountId,
    per_page: 100
  })) {
    if (namespace.title === title)
      return { id: namespace.id, title: namespace.title }
  }
  return null
}

export async function createNamespace(
  config: InfrastructureConfig,
  title: string
): Promise<KvNamespace> {
  const { id } = await config.client.kv.namespaces.create({
    account_id: config.accountId,
    title
  })
  return { id, title }
}

/**
 * Deletes every key that is not in `liveKeys`. A namespace that is adopted
 * again after its KV setup was removed still holds the links that were deleted
 * or retired in between; republishing only writes live links, so without this
 * a deleted link would resolve again.
 */
export async function pruneNamespace(
  config: InfrastructureConfig,
  namespaceId: string,
  liveKeys: Set<string>
): Promise<number> {
  const staleKeys: string[] = []
  for await (const key of config.client.kv.namespaces.keys.list(namespaceId, {
    account_id: config.accountId
  })) {
    if (!liveKeys.has(key.name)) staleKeys.push(key.name)
  }

  for (let index = 0; index < staleKeys.length; index += BULK_DELETE_CHUNK) {
    await config.client.kv.namespaces.bulkDelete(namespaceId, {
      account_id: config.accountId,
      body: staleKeys.slice(index, index + BULK_DELETE_CHUNK)
    })
  }
  return staleKeys.length
}
