import { type Env, isKvNamespace } from './env'
import { fetchShortLinkByPath, toRoutingRecord } from './graphql'
import {
  type DomainRecord,
  type RoutingRecord,
  isDomainRecord,
  isRoutingRecord,
  parseRecord
} from './records'
import type { LinkLookupHit } from './resolve'

export const DOMAIN_CACHE_TTL_MS = 60_000

/** The one piece of the execution context the store needs (Hono's context type is narrower than workers-types'). */
export type BackgroundContext = Pick<ExecutionContext, 'waitUntil'>

const D1_SELECT_VALUE = 'SELECT value FROM short_link_records WHERE key = ?'

/** The global namespace's binding name, for logs. */
export const GLOBAL_BINDING = 'SHORT_LINKS_KV'

interface CachedDomain {
  record: DomainRecord
  expiresAt: number
}

/** Per-isolate domain cache: one KV/D1 read per host per minute at most. */
const domainCache = new Map<string, CachedDomain>()

/** Bindings already reported as missing, so each is logged once per isolate. */
const reportedMissingBindings = new Set<string>()

/** Test hook; production never needs it. */
export function clearDomainCache(): void {
  domainCache.clear()
}

/** Test hook; production never needs it. */
export function clearMissingBindingLog(): void {
  reportedMissingBindings.clear()
}

/** Lower-cased, port-stripped host from the request URL. */
export function normaliseHost(host: string): string {
  const withoutPort = host.startsWith('[')
    ? host.replace(/\]:\d+$/, ']')
    : host.replace(/:\d+$/, '')
  return withoutPort.toLowerCase()
}

/** Global-namespace key of a global link. */
export function globalLinkKey(slug: string): string {
  return `link:${slug}`
}

/** D1 key of a domain's link. */
export function domainLinkKey(hostname: string, slug: string): string {
  return `link:${hostname}/${slug}`
}

/** D1 key of a global link. */
export function globalD1Key(slug: string): string {
  return `global:${slug}`
}

/**
 * The domain's own namespace, read through `env[domain.kvBinding]`. Null when
 * the domain has no binding or the binding is not in `wrangler.toml`; the
 * latter is a deployment gap and is logged once per isolate.
 */
export function domainNamespace(
  env: Env,
  domain: Pick<DomainRecord, 'kvBinding'>
): KVNamespace | null {
  const binding = domain.kvBinding
  if (binding == null || binding === '') return null

  const candidate: unknown = env[binding]
  if (isKvNamespace(candidate)) return candidate

  if (!reportedMissingBindings.has(binding)) {
    reportedMissingBindings.add(binding)
    console.error(JSON.stringify({ event: 'missing_binding', binding }))
  }
  return null
}

async function readKv<T>(
  namespace: KVNamespace,
  key: string,
  validate: (value: unknown) => value is T
): Promise<T | null> {
  try {
    const value: unknown = await namespace.get(key, 'json')
    return parseRecord(value, validate)
  } catch (error) {
    console.error(JSON.stringify({ event: 'kv_read_failed', key }), error)
    return null
  }
}

async function readD1<T>(
  env: Env,
  key: string,
  validate: (value: unknown) => value is T
): Promise<T | null> {
  try {
    const value = await env.SHORT_LINKS_DB.prepare(D1_SELECT_VALUE)
      .bind(key)
      .first<string>('value')
    return parseRecord(value, validate)
  } catch (error) {
    console.error(JSON.stringify({ event: 'd1_read_failed', key }), error)
    return null
  }
}

/** Step 1: `domain:<host>` from the global namespace, then D1, cached for 60 s per isolate. */
export async function loadDomain(
  env: Env,
  host: string,
  now: number = Date.now()
): Promise<DomainRecord | null> {
  const cached = domainCache.get(host)
  if (cached != null && cached.expiresAt > now) return cached.record

  const key = `domain:${host}`
  const record =
    (await readKv(env.SHORT_LINKS_KV, key, isDomainRecord)) ??
    (await readD1(env, key, isDomainRecord))

  if (record == null) return null

  domainCache.set(host, { record, expiresAt: now + DOMAIN_CACHE_TTL_MS })
  return record
}

/**
 * Step 3, the lookup order: the domain namespace (`<slug>`), the global
 * namespace (`link:<slug>`), D1 (`link:<hostname>/<slug>`, then
 * `global:<slug>`), then api-media. An api-media hit is a publish gap: the
 * converted record is written back to the namespace that should have had it
 * (the domain's when the link belongs to this domain and the binding exists,
 * else the global one when the link is global, else nowhere) in the
 * background and logged so the gap can be repaired upstream.
 */
export async function lookupLink(
  env: Env,
  ctx: BackgroundContext,
  domain: DomainRecord,
  slug: string
): Promise<LinkLookupHit | null> {
  const ownNamespace = domainNamespace(env, domain)
  if (ownNamespace != null) {
    const fromDomainKv = await readKv(ownNamespace, slug, isRoutingRecord)
    if (fromDomainKv != null) {
      return { record: fromDomainKv, resolvedFrom: 'kv' }
    }
  }

  const fromGlobalKv = await readKv(
    env.SHORT_LINKS_KV,
    globalLinkKey(slug),
    isRoutingRecord
  )
  if (fromGlobalKv != null) {
    return { record: fromGlobalKv, resolvedFrom: 'kv-global' }
  }

  const fromD1 = await readD1(
    env,
    domainLinkKey(domain.hostname, slug),
    isRoutingRecord
  )
  if (fromD1 != null) return { record: fromD1, resolvedFrom: 'd1' }

  const fromGlobalD1 = await readD1(env, globalD1Key(slug), isRoutingRecord)
  if (fromGlobalD1 != null) {
    return { record: fromGlobalD1, resolvedFrom: 'd1-global' }
  }

  const link = await fetchShortLinkByPath({
    endpoint: env.CORE_GRAPHQL_ENDPOINT,
    hostname: domain.hostname,
    pathname: slug
  })
  if (link == null) return null

  const record = toRoutingRecord(link, domain, slug)
  if (record == null) return null

  const target = writeBackTarget(env, domain, record, slug, ownNamespace)
  if (target != null) writeBack(ctx, target.namespace, target.key, record)
  console.log(
    JSON.stringify({
      event: 'publish_gap',
      key: domainLinkKey(domain.hostname, slug),
      target: target?.binding ?? null
    })
  )

  return { record, resolvedFrom: 'api' }
}

interface WriteBackTarget {
  namespace: KVNamespace
  key: string
  binding: string
}

function writeBackTarget(
  env: Env,
  domain: DomainRecord,
  record: RoutingRecord,
  slug: string,
  ownNamespace: KVNamespace | null
): WriteBackTarget | null {
  if (record.hostname === domain.hostname && ownNamespace != null) {
    return {
      namespace: ownNamespace,
      key: slug,
      binding: domain.kvBinding ?? GLOBAL_BINDING
    }
  }
  if (record.global) {
    return {
      namespace: env.SHORT_LINKS_KV,
      key: globalLinkKey(slug),
      binding: GLOBAL_BINDING
    }
  }
  return null
}

function writeBack(
  ctx: BackgroundContext,
  namespace: KVNamespace,
  key: string,
  record: RoutingRecord
): void {
  try {
    ctx.waitUntil(
      namespace.put(key, JSON.stringify(record)).catch((error: unknown) => {
        console.error(
          JSON.stringify({ event: 'kv_write_back_failed', key }),
          error
        )
      })
    )
  } catch (error) {
    console.error(JSON.stringify({ event: 'kv_write_back_failed', key }), error)
  }
}
