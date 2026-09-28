/**
 * Edge store record shapes (prds/short-links/TECH-DESIGN.md, "Edge store
 * contracts"). api-media publishes these to KV and D1; the Worker only reads
 * them. `v` is the shape version: any record whose `v` is not 1 is treated as a
 * miss for the store it came from so the Worker falls through to the next one.
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

/** `domain:<hostname>` */
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
}

/** `link:<hostname>/<pathname>` */
export interface RoutingRecord {
  v: 1
  id: string
  to: string
  status: number
  fallbackTo: string | null
  paused: boolean
  assetClass: AssetClass
  placement: Placement | null
  campaignIds: string[]
  videoId: string | null
  youtubeVideoId: string | null
  language: string | null
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
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 300 &&
    value <= 399
  )
}

/**
 * Validates a domain record. A record published before `pathPrefix` existed
 * has none; it is normalised in place to the empty string (root), so `v` stays
 * 1. A present non-string `pathPrefix` is invalid.
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
    return true
  }
  if (typeof value.pathPrefix !== 'string') return false
  value.pathPrefix = value.pathPrefix.replace(/^\/+|\/+$/g, '')
  return true
}

export function isRoutingRecord(value: unknown): value is RoutingRecord {
  if (!isObject(value)) return false
  if (value.v !== RECORD_VERSION) return false
  if (typeof value.id !== 'string' || value.id === '') return false
  if (typeof value.to !== 'string' || value.to === '') return false
  if (!isRedirectStatus(value.status)) return false
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
  return true
}

/**
 * Parses a raw store value (KV `json` or a D1 `value` column) into a validated
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
