import { Hono } from 'hono'

import { type Env, isKvNamespace } from './env'
import { clearDomainCache } from './store'

/**
 * Local stand-in for the Cloudflare REST endpoints api-media's edge publisher
 * calls (KV bulk write, KV delete), backed by this Worker's own bindings.
 * `wrangler dev` keeps KV in miniflare, which api.cloudflare.com cannot reach,
 * so without this a local api-media has nothing to publish to.
 *
 * Only `src/local.ts` (the `nx serve` entry) mounts it. `wrangler.toml` keeps
 * `main` on `src/index.ts`, so this file is never in a deployed bundle.
 *
 * Binding names stand in for ids, because a Worker cannot see the ids its
 * bindings were declared with: the namespace id in the path is the KV binding
 * name (`SHORT_LINKS_KV`, `KV_JESUS_FILM`, ...).
 */
export const LOCAL_EDGE_API_PREFIX = '/client/v4/'

const ACCOUNT = '/client/v4/accounts/:accountId'

interface BulkPair {
  key: string
  value: string
}

function isBulkPair(value: unknown): value is BulkPair {
  return (
    typeof value === 'object' &&
    value != null &&
    typeof (value as BulkPair).key === 'string' &&
    typeof (value as BulkPair).value === 'string'
  )
}

/** The Cloudflare API envelope, which the SDK unwraps `result` from. */
function success(result: unknown): Response {
  return Response.json({ success: true, errors: [], messages: [], result })
}

function failure(status: number, message: string): Response {
  return Response.json(
    {
      success: false,
      errors: [{ code: status, message }],
      messages: [],
      result: null
    },
    { status }
  )
}

function missingBinding(binding: string): Response {
  return failure(
    404,
    `local edge API: no KV binding named "${binding}" in wrangler.toml (locally the id is the binding name)`
  )
}

const localEdgeApi = new Hono<{ Bindings: Env }>()

localEdgeApi.put(
  `${ACCOUNT}/storage/kv/namespaces/:namespaceId/bulk`,
  async (c) => {
    const binding = c.req.param('namespaceId')
    const namespace = c.env[binding]
    if (!isKvNamespace(namespace)) return missingBinding(binding)

    const pairs: unknown = await c.req.json().catch(() => null)
    if (!Array.isArray(pairs) || !pairs.every(isBulkPair))
      return failure(400, 'body must be an array of { key, value } strings')

    for (const { key, value } of pairs) await namespace.put(key, value)
    // a republished domain record should not wait out the 60 s cache
    clearDomainCache()
    return success({
      successful_key_count: pairs.length,
      unsuccessful_keys: []
    })
  }
)

localEdgeApi.delete(
  `${ACCOUNT}/storage/kv/namespaces/:namespaceId/values/:key`,
  async (c) => {
    const binding = c.req.param('namespaceId')
    const namespace = c.env[binding]
    if (!isKvNamespace(namespace)) return missingBinding(binding)

    await namespace.delete(c.req.param('key'))
    clearDomainCache()
    return success({})
  }
)

localEdgeApi.all('*', (c) =>
  failure(
    404,
    `local edge API: ${c.req.method} ${new URL(c.req.url).pathname} is not implemented`
  )
)

export { localEdgeApi }
