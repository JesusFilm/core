import type { RedirectEvent } from './event'

/** Bindings and vars declared in `wrangler.toml`. */
export interface Env {
  SHORT_LINKS_KV: KVNamespace
  SHORT_LINKS_DB: D1Database
  SHORT_LINKS_EVENTS: Queue<RedirectEvent>
  CORE_GRAPHQL_ENDPOINT?: string
  CLICKHOUSE_URL?: string
  CLICKHOUSE_DATABASE?: string
  /** `wrangler secret` */
  CLICKHOUSE_USER?: string
  /** `wrangler secret` */
  CLICKHOUSE_PASSWORD?: string
}
