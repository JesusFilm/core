/**
 * Edge store record shapes (prds/short-links/TECH-DESIGN.md, "Edge store
 * contracts" as amended on 2026-09-28 and 2026-09-29). api-media publishes
 * these to KV; the Worker only reads them. `v` is the shape version:
 * any record whose `v` is not 1 is treated as a miss for the store it came from
 * so the Worker falls through to the next one. Fields added after the first
 * publish are optional on the wire and normalised in place by the validators.
 */

export const RECORD_VERSION = 1

export type NotFoundBehaviour = 'lostPage' | 'fallback' | 'passthrough'

export type AssetClass = 'standard' | 'permanent' | 'videoEmbedded'

export type Placement =
  | 'description'
  | 'endScreen'
  | 'card'
  | 'communityPost'
  | 'inVideoQr'
  | 'other'

/** `domain:<hostname>` in the global namespace. */
export interface DomainRecord {
  v: 1
  id: string
  hostname: string
  redirectStatus: number
  fallbackTo: string | null
  notFound: NotFoundBehaviour
  passthroughOrigin: string | null
  reservedPaths: string[]
  slugCaseSensitive: boolean
  /**
   * The path the short links live under, without leading or trailing slashes
   * (`s`, `a/b`). Empty keeps the domain at the root.
   */
  pathPrefix: string
  /**
   * Name of the Worker KV binding holding this domain's routing records
   * (`KV_JESUS_FILM`). Null: the domain has no namespace and is served only
   * through global links and the api-media fallback.
   */
  kvBinding: string | null
}

/**
 * A routing record: `<pathname>` in the domain namespace, `link:<pathname>` in
 * the global namespace.
 */
export interface RoutingRecord {
  v: 1
  id: string
  to: string
  /** The link's own status override only; null means "use the serving domain's". */
  status: number | null
  /** The link's own fallback override only. */
  fallbackTo: string | null
  paused: boolean
  assetClass: AssetClass
  placement: Placement | null
  campaignIds: string[]
  videoId: string | null
  youtubeVideoId: string | null
  language: string | null
  /** Resolves on every domain that has no link of its own for the pathname. */
  global: boolean
  /** The owning domain's hostname; reporting only. */
  hostname: string
}

const NOT_FOUND_BEHAVIOURS: readonly string[] = [
  'lostPage',
  'fallback',
  'passthrough'
]

const ASSET_CLASSES: readonly string[] = [
  'standard',
  'permanent',
  'videoEmbedded'
]

const REDIRECT_STATUSES: readonly number[] = [301, 302, 307, 308]

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value != null && !Array.isArray(value)
}

function isNullableString(value: unknown): value is string | null | undefined {
  return value == null || typeof value === 'string'
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isRedirectStatus(value: unknown): value is number {
  return typeof value === 'number' && REDIRECT_STATUSES.includes(value)
}

/**
 * Validates a domain record and normalises in place the fields that were
 * added after the first publish: a missing `pathPrefix` becomes `''` (root)
 * and a missing `kvBinding` becomes null. `v` stays 1. A present value of the
 * wrong type makes the record invalid.
 */
export function isDomainRecord(value: unknown): value is DomainRecord {
  if (!isObject(value)) return false
  if (value.v !== RECORD_VERSION) return false
  if (typeof value.id !== 'string' || value.id === '') return false
  if (typeof value.hostname !== 'string' || value.hostname === '') return false
  if (!isRedirectStatus(value.redirectStatus)) return false
  if (!isNullableString(value.fallbackTo)) return false
  if (
    typeof value.notFound !== 'string' ||
    !NOT_FOUND_BEHAVIOURS.includes(value.notFound)
  )
    return false
  if (!isNullableString(value.passthroughOrigin)) return false
  if (!isStringArray(value.reservedPaths)) return false
  if (typeof value.slugCaseSensitive !== 'boolean') return false

  if (value.pathPrefix === undefined) {
    value.pathPrefix = ''
  } else if (typeof value.pathPrefix === 'string') {
    value.pathPrefix = value.pathPrefix.replace(/^\/+|\/+$/g, '')
  } else {
    return false
  }

  if (value.kvBinding === undefined || value.kvBinding === '') {
    value.kvBinding = null
  } else if (!isNullableString(value.kvBinding)) {
    return false
  }

  return true
}

/**
 * Validates a routing record and normalises in place: a missing `status`
 * becomes null (a present one must be 301/302/307/308), a missing `global`
 * becomes false, a missing `hostname` becomes `''`.
 */
export function isRoutingRecord(value: unknown): value is RoutingRecord {
  if (!isObject(value)) return false
  if (value.v !== RECORD_VERSION) return false
  if (typeof value.id !== 'string' || value.id === '') return false
  if (typeof value.to !== 'string' || value.to === '') return false
  if (value.status == null) {
    value.status = null
  } else if (!isRedirectStatus(value.status)) {
    return false
  }
  if (!isNullableString(value.fallbackTo)) return false
  if (typeof value.paused !== 'boolean') return false
  if (
    typeof value.assetClass !== 'string' ||
    !ASSET_CLASSES.includes(value.assetClass)
  )
    return false
  if (!isNullableString(value.placement)) return false
  if (!isStringArray(value.campaignIds)) return false
  if (!isNullableString(value.videoId)) return false
  if (!isNullableString(value.youtubeVideoId)) return false
  if (!isNullableString(value.language)) return false

  if (value.global === undefined) {
    value.global = false
  } else if (typeof value.global !== 'boolean') {
    return false
  }

  if (value.hostname == null) {
    value.hostname = ''
  } else if (typeof value.hostname !== 'string') {
    return false
  }

  return true
}

/**
 * Parses a raw store value (KV `json`, or a JSON string) into a validated
 * record, returning null for anything unparseable or of the wrong shape.
 */
export function parseRecord<T>(
  raw: unknown,
  validate: (value: unknown) => value is T
): T | null {
  if (raw == null) return null
  if (typeof raw === 'string') {
    try {
      const parsed: unknown = JSON.parse(raw)
      return validate(parsed) ? parsed : null
    } catch {
      return null
    }
  }
  return validate(raw) ? raw : null
}
