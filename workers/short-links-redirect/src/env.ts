import type { RedirectEvent } from './event'

/**
 * Bindings and vars declared in `wrangler.toml`.
 *
 * KV is two-tier: `SHORT_LINKS_KV` is the global namespace (domain records
 * and global links) and every domain has its own namespace, bound under the
 * name carried in the domain record's `kvBinding`. The known ones are typed
 * below; the index signature is what `env[domain.kvBinding]` reads through,
 * guarded at runtime by `isKvNamespace`.
 */
export interface Env {
  SHORT_LINKS_KV: KVNamespace
  KV_JESUS_FILM?: KVNamespace
  KV_NXSTP_IS?: KVNamespace
  KV_ARC_GT?: KVNamespace
  KV_STG_ARC_GT?: KVNamespace
  SHORT_LINKS_DB: D1Database
  SHORT_LINKS_EVENTS: Queue<RedirectEvent>
  CORE_GRAPHQL_ENDPOINT?: string
  CLICKHOUSE_URL?: string
  CLICKHOUSE_DATABASE?: string
  /** `wrangler secret` */
  CLICKHOUSE_USER?: string
  /** `wrangler secret` */
  CLICKHOUSE_PASSWORD?: string
  /** Per-domain KV namespaces added after this file was written. */
  [binding: string]: unknown
}

/** Runtime guard for a value read through the index signature. */
export function isKvNamespace(value: unknown): value is KVNamespace {
  return (
    typeof value === 'object' &&
    value != null &&
    typeof (value as { get?: unknown }).get === 'function'
  )
}
