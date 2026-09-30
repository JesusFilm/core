import { buildDestination } from './destination'
import type { DomainRecord, RoutingRecord } from './records'

export const SLUG_GRAMMAR = /^[A-Za-z0-9_.~-]{1,64}$/

const DEFAULT_REDIRECT_STATUS = 307

/** Where a not-found path's `location` came from; mirrors `ShortLinkResolutionSource`. */
export type RedirectSource = 'link' | 'linkFallback' | 'domainFallback'

/** Which store answered: the domain namespace, the global namespace, D1 (domain / global key), or api-media. */
export type ResolvedFrom = 'kv' | 'kv-global' | 'd1' | 'd1-global' | 'api'

export interface LinkLookupHit {
  record: RoutingRecord
  resolvedFrom: ResolvedFrom
}

export type LinkLookup = (
  key: string,
  hostname: string,
  pathname: string
) => Promise<LinkLookupHit | null>

export type Resolution =
  | {
      kind: 'redirect'
      location: string
      status: number
      source: RedirectSource
      /** Present when a routing record backed the redirect (`link` / `linkFallback`). */
      record?: RoutingRecord
      /** The pathname the record was looked up under (lower-cased when the domain is case-insensitive). */
      pathname?: string
      resolvedFrom?: ResolvedFrom
    }
  | { kind: 'lostPage' }
  | { kind: 'passthrough'; location: string }

export interface ResolveInput {
  domain: DomainRecord
  /** The raw request pathname, leading slash included (e.g. `/abc` or `/s/1_jf-0-0/529`). */
  pathname: string
  /** The raw request search string, `?` included, or the empty string. */
  search: string
  lookup: LinkLookup
}

/**
 * Turns a request path on a known domain into a redirect, the lost page, or a
 * passthrough. Pure apart from the injected `lookup`, so every branch can be
 * unit-tested without bindings.
 */
export async function resolve({
  domain,
  pathname,
  search,
  lookup
}: ResolveInput): Promise<Resolution> {
  const path = pathUnderPrefix(domain, pathname)

  if (path == null || !isCandidateSlug(domain, path)) {
    return notFoundBehaviour(domain, pathname, search)
  }

  const slug = domain.slugCaseSensitive ? path : path.toLowerCase()
  const key = `link:${domain.hostname}/${slug}`
  const hit = await lookup(key, domain.hostname, slug)

  if (hit == null) return notFoundBehaviour(domain, pathname, search)

  const { record, resolvedFrom } = hit
  const status =
    record.status ?? domain.redirectStatus ?? DEFAULT_REDIRECT_STATUS

  if (record.paused) {
    if (record.fallbackTo != null && record.fallbackTo !== '') {
      return {
        kind: 'redirect',
        location: record.fallbackTo,
        status,
        source: 'linkFallback',
        record,
        pathname: slug,
        resolvedFrom
      }
    }
    if (domain.fallbackTo != null && domain.fallbackTo !== '') {
      return {
        kind: 'redirect',
        location: domain.fallbackTo,
        status: domain.redirectStatus ?? DEFAULT_REDIRECT_STATUS,
        source: 'domainFallback'
      }
    }
    return notFoundBehaviour(domain, pathname, search)
  }

  let location: string
  try {
    location = buildDestination(record.to, new URLSearchParams(search))
  } catch (error) {
    console.error(
      JSON.stringify({ event: 'invalid_destination', key, to: record.to }),
      error
    )
    return notFoundBehaviour(domain, pathname, search)
  }

  return {
    kind: 'redirect',
    location,
    status,
    source: 'link',
    record,
    pathname: slug,
    resolvedFrom
  }
}

/**
 * Strips the leading slash and the domain's `pathPrefix`. Returns null when
 * the domain has a prefix and the path is outside it, or is exactly the prefix
 * (`/<prefix>` or `/<prefix>/`). The lookup key never includes the prefix.
 */
export function pathUnderPrefix(
  domain: Pick<DomainRecord, 'pathPrefix'>,
  pathname: string
): string | null {
  const path = pathname.startsWith('/') ? pathname.slice(1) : pathname
  const prefix = domain.pathPrefix ?? ''
  if (prefix === '') return path
  if (!path.startsWith(`${prefix}/`)) return null
  const rest = path.slice(prefix.length + 1)
  return rest === '' ? null : rest
}

/**
 * Step 2 of the request flow: an empty path, a path containing `/`, a first
 * segment in `reservedPaths`, or a path outside the slug grammar is never a
 * link and skips the store lookups entirely.
 */
export function isCandidateSlug(domain: DomainRecord, path: string): boolean {
  if (path === '') return false
  if (path.includes('/')) return false
  if (isReserved(domain, path)) return false
  return SLUG_GRAMMAR.test(path)
}

function isReserved(domain: DomainRecord, firstSegment: string): boolean {
  if (domain.reservedPaths.includes(firstSegment)) return true
  if (domain.slugCaseSensitive) return false
  const lowered = firstSegment.toLowerCase()
  return domain.reservedPaths.some(
    (reserved) => reserved.toLowerCase() === lowered
  )
}

/**
 * The domain's not-found behaviour. `pathname` and `search` are the *original*
 * request values (slashes and all) so passthrough forwards them untouched.
 */
export function notFoundBehaviour(
  domain: DomainRecord,
  pathname: string,
  search: string
): Resolution {
  switch (domain.notFound) {
    case 'fallback':
      if (domain.fallbackTo == null || domain.fallbackTo === '') {
        return { kind: 'lostPage' }
      }
      return {
        kind: 'redirect',
        location: domain.fallbackTo,
        status: domain.redirectStatus ?? DEFAULT_REDIRECT_STATUS,
        source: 'domainFallback'
      }
    case 'passthrough':
      if (domain.passthroughOrigin == null || domain.passthroughOrigin === '') {
        return { kind: 'lostPage' }
      }
      return {
        kind: 'passthrough',
        location: `${domain.passthroughOrigin.replace(/\/+$/, '')}${pathname}${search}`
      }
    case 'lostPage':
    default:
      return { kind: 'lostPage' }
  }
}
