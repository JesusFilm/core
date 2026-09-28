import type {
  ShortLink,
  ShortLinkAssetClass,
  ShortLinkDomain,
  ShortLinkNotFound,
  ShortLinkPlacement
} from '@core/prisma/media/client'

import { normalizePathname } from '../lib/slug'

/**
 * The shapes written to the edge store (Workers KV + D1) and read by
 * `workers/short-links-redirect`. `v` lets the Worker reject a shape it does
 * not understand and fall through to the next store. See
 * prds/short-links/TECH-DESIGN.md "Edge store contracts".
 */

export const EDGE_RECORD_VERSION = 1

export interface DomainRecord {
  v: typeof EDGE_RECORD_VERSION
  id: string
  hostname: string
  pathPrefix: string
  redirectStatus: number
  fallbackTo: string | null
  notFound: ShortLinkNotFound
  passthroughOrigin: string | null
  reservedPaths: string[]
  slugCaseSensitive: boolean
}

export interface RoutingRecord {
  v: typeof EDGE_RECORD_VERSION
  id: string
  to: string
  status: number
  fallbackTo: string | null
  paused: boolean
  assetClass: ShortLinkAssetClass
  placement: ShortLinkPlacement | null
  campaignIds: string[]
  videoId: string | null
  youtubeVideoId: string | null
  language: string | null
}

export type DomainForRecord = Pick<
  ShortLinkDomain,
  | 'id'
  | 'hostname'
  | 'pathPrefix'
  | 'redirectStatus'
  | 'fallbackTo'
  | 'notFound'
  | 'passthroughOrigin'
  | 'reservedPaths'
  | 'slugCaseSensitive'
>

export type LinkForRecord = Pick<
  ShortLink,
  | 'id'
  | 'pathname'
  | 'to'
  | 'status'
  | 'redirectStatus'
  | 'fallbackTo'
  | 'assetClass'
  | 'placement'
  | 'videoId'
  | 'youtubeVideoId'
  | 'language'
  | 'brightcoveId'
  | 'redirectType'
> & { campaigns: Array<{ id: string }> }

export function domainKey(hostname: string): string {
  return `domain:${hostname.toLowerCase()}`
}

/**
 * `link:<hostname>/<pathname>` — hostname always lower-case, pathname exactly
 * as minted unless the domain is case-insensitive (then lower-cased, matching
 * the Worker's lookup).
 */
export function recordKeyForLink(
  link: Pick<ShortLink, 'pathname'>,
  domain: Pick<ShortLinkDomain, 'hostname' | 'slugCaseSensitive'>
): string {
  return `link:${domain.hostname.toLowerCase()}/${normalizePathname(
    link.pathname,
    domain
  )}`
}

export function buildDomainRecord(domain: DomainForRecord): DomainRecord {
  return {
    v: EDGE_RECORD_VERSION,
    id: domain.id,
    hostname: domain.hostname.toLowerCase(),
    pathPrefix: domain.pathPrefix ?? '',
    redirectStatus: domain.redirectStatus,
    fallbackTo: domain.fallbackTo,
    notFound: domain.notFound,
    passthroughOrigin: domain.passthroughOrigin,
    reservedPaths: domain.reservedPaths,
    slugCaseSensitive: domain.slugCaseSensitive
  }
}

/**
 * The URL the edge redirects to for an active link. An arc.gt link that
 * carries `brightcoveId` + `redirectType` keeps resolving through the Arclight
 * API (the domain's passthrough origin) so Brightcove URLs are built exactly
 * as they are today — one hop, same as the current wholesale redirect.
 */
export function effectiveDestination(
  link: Pick<ShortLink, 'to' | 'pathname' | 'brightcoveId' | 'redirectType'>,
  domain: Pick<ShortLinkDomain, 'passthroughOrigin'>
): string {
  if (
    link.brightcoveId != null &&
    link.redirectType != null &&
    domain.passthroughOrigin != null
  )
    return `${domain.passthroughOrigin.replace(/\/+$/, '')}/${link.pathname}`
  return link.to
}

export function effectiveRedirectStatus(
  link: Pick<ShortLink, 'redirectStatus'>,
  domain: Pick<ShortLinkDomain, 'redirectStatus'>
): number {
  return link.redirectStatus ?? domain.redirectStatus
}

export function buildRoutingRecord(
  link: LinkForRecord,
  domain: Pick<
    ShortLinkDomain,
    'redirectStatus' | 'passthroughOrigin' | 'fallbackTo'
  >
): RoutingRecord {
  return {
    v: EDGE_RECORD_VERSION,
    id: link.id,
    to: effectiveDestination(link, domain),
    status: effectiveRedirectStatus(link, domain),
    fallbackTo: link.fallbackTo,
    paused: link.status === 'paused',
    assetClass: link.assetClass,
    placement: link.placement,
    campaignIds: link.campaigns.map(({ id }) => id),
    videoId: link.videoId,
    youtubeVideoId: link.youtubeVideoId,
    language: link.language
  }
}

/** A link the edge should serve: not soft-deleted and not retired. */
export function isLiveLink(
  link: Pick<ShortLink, 'deletedAt' | 'status'>
): boolean {
  return link.deletedAt == null && link.status !== 'retired'
}
