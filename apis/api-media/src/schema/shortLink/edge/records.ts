import type {
  ShortLink,
  ShortLinkAssetClass,
  ShortLinkDomain,
  ShortLinkNotFound,
  ShortLinkPlacement
} from '@core/prisma/media/client'

import { normalizePathname } from '../lib/slug'

/**
 * The shapes written to the edge store and read by
 * `workers/short-links-redirect`. `v` lets the Worker reject a shape it does
 * not understand and fall through to the next store. See
 * prds/short-links/TECH-DESIGN.md "Edge store contracts" and "Per-domain KV
 * namespaces and global slugs".
 *
 * Namespaces and keys:
 * - global namespace (`CLOUDFLARE_SHORT_LINKS_KV_NAMESPACE_ID`):
 *   `domain:<hostname>` domain records, `link:<pathname>` global links
 * - one namespace per domain (`ShortLinkDomain.kvNamespaceId`):
 *   `<pathname>` the domain's routing records (bare slug, no prefix)
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
  /** Worker binding of the domain's own namespace; null = global links only */
  kvBinding: string | null
}

export interface RoutingRecord {
  v: typeof EDGE_RECORD_VERSION
  id: string
  to: string
  /** the link's own override only; the Worker falls back to the serving domain */
  status: number | null
  /** the link's own override only */
  fallbackTo: string | null
  paused: boolean
  global: boolean
  /** the owning domain (reporting) */
  hostname: string
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
  | 'kvBinding'
>

export type LinkForRecord = Pick<
  ShortLink,
  | 'id'
  | 'pathname'
  | 'to'
  | 'status'
  | 'global'
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

/** `domain:<hostname>` in the global namespace. */
export function domainKey(hostname: string): string {
  return `domain:${hostname.toLowerCase()}`
}

/**
 * The bare slug — the key in the domain's own namespace. Lower-cased when the
 * domain is case-insensitive, matching the Worker's lookup.
 */
export function domainLinkKey(
  link: Pick<ShortLink, 'pathname'>,
  domain: Pick<ShortLinkDomain, 'slugCaseSensitive'>
): string {
  return normalizePathname(link.pathname, domain)
}

/** `link:<pathname>` in the global namespace (global pathnames are lower-case). */
export function globalLinkKey(link: Pick<ShortLink, 'pathname'>): string {
  return `link:${link.pathname}`
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
    slugCaseSensitive: domain.slugCaseSensitive,
    kvBinding: domain.kvBinding
  }
}

/**
 * The URL the edge redirects to for an active link. An arc.gt link that
 * carries `brightcoveId` + `redirectType` keeps resolving through the Arclight
 * API (the owning domain's passthrough origin) so Brightcove URLs are built
 * exactly as they are today — one hop, same as the current wholesale redirect.
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

/** Status the serving domain answers with: link override, else its default. */
export function effectiveRedirectStatus(
  link: Pick<ShortLink, 'redirectStatus'>,
  domain: Pick<ShortLinkDomain, 'redirectStatus'>
): number {
  return link.redirectStatus ?? domain.redirectStatus
}

export function buildRoutingRecord(
  link: LinkForRecord,
  domain: Pick<ShortLinkDomain, 'hostname' | 'passthroughOrigin'>
): RoutingRecord {
  return {
    v: EDGE_RECORD_VERSION,
    id: link.id,
    to: effectiveDestination(link, domain),
    status: link.redirectStatus,
    fallbackTo: link.fallbackTo,
    paused: link.status === 'paused',
    global: link.global,
    hostname: domain.hostname.toLowerCase(),
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
