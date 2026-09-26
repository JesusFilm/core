import type { DomainRecord, Placement, RoutingRecord } from './records'

export const GRAPHQL_TIMEOUT_MS = 2000

/**
 * The api-media fallback (step 3 of the request flow). Only reached when both
 * KV and D1 miss, which means a publish gap; the caller writes the converted
 * record back to KV and logs `publish_gap`.
 */
export const SHORT_LINK_BY_PATH_QUERY = `
  query ShortLinkByPath($hostname: String!, $pathname: String!) {
    shortLinkByPath(hostname: $hostname, pathname: $pathname) {
      __typename
      ... on QueryShortLinkByPathSuccess {
        data {
          id
          to
          status
          redirectStatus
          fallbackTo
          assetClass
          placement
          videoId
          youtubeVideoId
          language
          brightcoveId
          redirectType
          campaigns {
            id
          }
          domain {
            redirectStatus
            fallbackTo
            passthroughOrigin
          }
        }
      }
    }
  }
`

export interface ShortLinkByPathData {
  id: string
  to: string
  status: 'active' | 'paused' | 'retired'
  redirectStatus: number | null
  fallbackTo: string | null
  assetClass: RoutingRecord['assetClass']
  placement: Placement | null
  videoId: string | null
  youtubeVideoId: string | null
  language: string | null
  brightcoveId: string | null
  redirectType: string | null
  campaigns: Array<{ id: string }>
  domain: {
    redirectStatus: number
    fallbackTo: string | null
    passthroughOrigin: string | null
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value != null
}

function hasStringId(value: unknown): boolean {
  return isObject(value) && typeof value.id === 'string'
}

/**
 * Narrows the GraphQL response body to the success member's `data`, or null
 * for GraphQL errors, the `NotFoundError` member, or any unexpected shape.
 */
export function readShortLinkByPath(body: unknown): ShortLinkByPathData | null {
  if (!isObject(body)) return null
  if (Array.isArray(body.errors) && body.errors.length > 0) return null

  const data: unknown = body.data
  if (!isObject(data)) return null

  const result: unknown = data.shortLinkByPath
  if (!isObject(result)) return null
  if (result.__typename !== 'QueryShortLinkByPathSuccess') return null

  const link: unknown = result.data
  if (!hasStringId(link)) return null

  return link as ShortLinkByPathData
}

export interface FetchShortLinkByPathInput {
  endpoint: string | undefined
  hostname: string
  pathname: string
  timeoutMs?: number
  fetchImpl?: typeof fetch
}

/**
 * Returns the short link from api-media, or null for a miss, a non-success
 * union member, a transport error, or the timeout. Never throws: an api-media
 * outage must degrade to the domain's not-found behaviour, not a 5xx.
 */
export async function fetchShortLinkByPath({
  endpoint,
  hostname,
  pathname,
  timeoutMs = GRAPHQL_TIMEOUT_MS,
  fetchImpl = fetch
}: FetchShortLinkByPathInput): Promise<ShortLinkByPathData | null> {
  if (endpoint == null || endpoint === '') return null

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: SHORT_LINK_BY_PATH_QUERY,
        variables: { hostname, pathname }
      }),
      signal: controller.signal
    })

    if (!response.ok) return null

    const body: unknown = await response.json()
    return readShortLinkByPath(body)
  } catch (error) {
    console.error(
      JSON.stringify({ event: 'api_lookup_failed', hostname, pathname }),
      error
    )
    return null
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Converts an api-media short link into the routing record api-media would
 * have published. Retired links are a miss (their edge keys are deleted).
 *
 * Brightcove passthrough rule (TECH-DESIGN.md, "Routing record"): an arc.gt
 * link carrying `brightcoveId` + `redirectType` keeps `to = <passthroughOrigin>/<pathname>`
 * so the Arclight API resolves the Brightcove URL exactly as it does today.
 */
export function toRoutingRecord(
  link: ShortLinkByPathData,
  domain: Pick<DomainRecord, 'passthroughOrigin' | 'redirectStatus'>,
  pathname: string
): RoutingRecord | null {
  if (link.status === 'retired') return null

  const passthroughOrigin =
    link.domain?.passthroughOrigin ?? domain.passthroughOrigin
  const usesBrightcovePassthrough =
    link.brightcoveId != null &&
    link.brightcoveId !== '' &&
    link.redirectType != null &&
    passthroughOrigin != null &&
    passthroughOrigin !== ''

  const to = usesBrightcovePassthrough
    ? `${passthroughOrigin.replace(/\/+$/, '')}/${pathname}`
    : link.to

  return {
    v: 1,
    id: link.id,
    to,
    status:
      link.redirectStatus ??
      link.domain?.redirectStatus ??
      domain.redirectStatus,
    fallbackTo: link.fallbackTo ?? null,
    paused: link.status === 'paused',
    assetClass: link.assetClass,
    placement: link.placement ?? null,
    campaignIds: (link.campaigns ?? []).map((campaign) => campaign.id),
    videoId: link.videoId ?? null,
    youtubeVideoId: link.youtubeVideoId ?? null,
    language: link.language ?? null
  }
}
