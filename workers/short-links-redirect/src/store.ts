import type { Env } from './env'
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

interface CachedDomain {
  record: DomainRecord
  expiresAt: number
}

/** Per-isolate domain cache: one KV/D1 read per host per minute at most. */
const domainCache = new Map<string, CachedDomain>()

/** Test hook; production never needs it. */
export function clearDomainCache(): void {
  domainCache.clear()
}

/** Lower-cased, port-stripped host from the request URL. */
export function normaliseHost(host: string): string {
  const withoutPort = host.startsWith('[')
    ? host.replace(/\]:\d+$/, ']')
    : host.replace(/:\d+$/, '')
  return withoutPort.toLowerCase()
}

async function readKv<T>(
  env: Env,
  key: string,
  validate: (value: unknown) => value is T
): Promise<T | null> {
  try {
    const value: unknown = await env.SHORT_LINKS_KV.get(key, 'json')
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

/** Step 1: `domain:<host>` from KV, then D1, cached for 60 s per isolate. */
export async function loadDomain(
  env: Env,
  host: string,
  now: number = Date.now()
): Promise<DomainRecord | null> {
  const cached = domainCache.get(host)
  if (cached != null && cached.expiresAt > now) return cached.record

  const key = `domain:${host}`
  const record =
    (await readKv(env, key, isDomainRecord)) ??
    (await readD1(env, key, isDomainRecord))

  if (record == null) return null

  domainCache.set(host, { record, expiresAt: now + DOMAIN_CACHE_TTL_MS })
  return record
}

/**
 * Step 3: `link:<host>/<path>` from KV, then D1, then api-media. An api-media
 * hit is a publish gap: the converted record is written back to KV in the
 * background and logged so the gap can be repaired upstream.
 */
export async function lookupLink(
  env: Env,
  ctx: BackgroundContext,
  domain: DomainRecord,
  key: string,
  pathname: string
): Promise<LinkLookupHit | null> {
  const fromKv = await readKv(env, key, isRoutingRecord)
  if (fromKv != null) return { record: fromKv, resolvedFrom: 'kv' }

  const fromD1 = await readD1(env, key, isRoutingRecord)
  if (fromD1 != null) return { record: fromD1, resolvedFrom: 'd1' }

  const link = await fetchShortLinkByPath({
    endpoint: env.CORE_GRAPHQL_ENDPOINT,
    hostname: domain.hostname,
    pathname
  })
  if (link == null) return null

  const record = toRoutingRecord(link, domain, pathname)
  if (record == null) return null

  writeBack(env, ctx, key, record)
  console.log(JSON.stringify({ event: 'publish_gap', key }))

  return { record, resolvedFrom: 'api' }
}

function writeBack(
  env: Env,
  ctx: BackgroundContext,
  key: string,
  record: RoutingRecord
): void {
  try {
    ctx.waitUntil(
      env.SHORT_LINKS_KV.put(key, JSON.stringify(record)).catch(
        (error: unknown) => {
          console.error(
            JSON.stringify({ event: 'kv_write_back_failed', key }),
            error
          )
        }
      )
    )
  } catch (error) {
    console.error(JSON.stringify({ event: 'kv_write_back_failed', key }), error)
  }
}
