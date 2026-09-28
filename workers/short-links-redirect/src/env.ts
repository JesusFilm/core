import type { RedirectEvent } from './event'

/** Bindings and vars declared in `wrangler.toml`. */
export interface Env {
  SHORT_LINKS_KV: KVNamespace
  SHORT_LINKS_DB: D1Database
  SHORT_LINKS_EVENTS: Queue<RedirectEvent>
  CORE_GRAPHQL_ENDPOINT?: string
  CLICKHOUSE_URL?: string
  CLICKHOUSE_DATABASE?: string
  /** Host the admin dashboard is served on (`jesus.film`). Empty disables the admin proxy. */
  ADMIN_HOSTNAME?: string
  /** Path the admin dashboard lives under (`/s/dashboard`). */
  ADMIN_PATH?: string
  /** Vercel deployment hostname of `short-links-admin`; proxied to over https. */
  ADMIN_PROXY_DEST?: string
  /** `wrangler secret` */
  CLICKHOUSE_USER?: string
  /** `wrangler secret` */
  CLICKHOUSE_PASSWORD?: string
}
