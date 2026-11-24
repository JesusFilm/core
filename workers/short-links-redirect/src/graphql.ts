import {
  type DomainRecord,
  type Placement,
  RECORD_VERSION,
  type RoutingRecord,
  isDomainRecord
} from './records'

export const GRAPHQL_TIMEOUT_MS = 2000

/**
 * The api-media fallback (step 3 of the request flow). Only reached when KV
 * has no record, which means a publish gap; the caller writes the converted
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
          global
          brightcoveId
          redirectType
          campaigns {
            id
          }
          domain {
            hostname
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
  global: boolean | null
  brightcoveId: string | null
  redirectType: string | null
  campaigns: Array<{ id: string }>
  domain: {
    hostname: string
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

interface GraphQlRequest {
  endpoint: string | undefined
  query: string
  variables: Record<string, string>
  timeoutMs: number
  fetchImpl: typeof fetch
}

/**
 * POSTs one query and returns the parsed body, or null when there is no
 * endpoint or the response is not OK. Throws on a transport error or the
 * timeout; each caller logs that with its own context.
 */
async function graphQlRequest({
  endpoint,
  query,
  variables,
  timeoutMs,
  fetchImpl
}: GraphQlRequest): Promise<unknown> {
  if (endpoint == null || endpoint === '') return null

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal
    })
    if (!response.ok) return null
    return await response.json()
  } finally {
    clearTimeout(timeout)
  }
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
  try {
    const body = await graphQlRequest({
      endpoint,
      query: SHORT_LINK_BY_PATH_QUERY,
      variables: { hostname, pathname },
      timeoutMs,
      fetchImpl
    })
    return readShortLinkByPath(body)
  } catch (error) {
    console.error(
      JSON.stringify({ event: 'api_lookup_failed', hostname, pathname }),
      error
    )
    return null
  }
}

/**
 * The api-media fallback for step 1: the routing settings of a domain, asked
 * for when KV has no `domain:<host>` record (never published, or KV cannot be
 * read). The selection is exactly the fields of a domain record.
 */
export const SHORT_LINK_DOMAIN_BY_HOSTNAME_QUERY = `
  query ShortLinkDomainByHostname($hostname: String!) {
    shortLinkDomainByHostname(hostname: $hostname) {
      __typename
      ... on QueryShortLinkDomainByHostnameSuccess {
        data {
          id
          hostname
          redirectStatus
          fallbackTo
          notFound
          passthroughOrigin
          reservedPaths
          slugCaseSensitive
          pathPrefix
          kvBinding
        }
      }
    }
  }
`

/**
 * Narrows the GraphQL response body to the domain record api-media would have
 * published, or null for GraphQL errors, the `NotFoundError` member, or a
 * shape the record validator rejects.
 */
export function readDomainRecord(body: unknown): DomainRecord | null {
  if (!isObject(body)) return null
  if (Array.isArray(body.errors) && body.errors.length > 0) return null

  const data: unknown = body.data
  if (!isObject(data)) return null

  const result: unknown = data.shortLinkDomainByHostname
  if (!isObject(result)) return null
  if (result.__typename !== 'QueryShortLinkDomainByHostnameSuccess') return null
  if (!isObject(result.data)) return null

  const record: unknown = { v: RECORD_VERSION, ...result.data }
  return isDomainRecord(record) ? record : null
}

export interface FetchDomainRecordInput {
  endpoint: string | undefined
  hostname: string
  timeoutMs?: number
  fetchImpl?: typeof fetch
}

/**
 * Returns the domain record from api-media, or null for an unknown host, a
 * transport error, or the timeout. Never throws: with KV and api-media both
 * unavailable an uncached host gets the lost page, not a 5xx.
 */
export async function fetchDomainRecord({
  endpoint,
  hostname,
  timeoutMs = GRAPHQL_TIMEOUT_MS,
  fetchImpl = fetch
}: FetchDomainRecordInput): Promise<DomainRecord | null> {
  try {
    const body = await graphQlRequest({
      endpoint,
      query: SHORT_LINK_DOMAIN_BY_HOSTNAME_QUERY,
      variables: { hostname },
      timeoutMs,
      fetchImpl
    })
    return readDomainRecord(body)
  } catch (error) {
    console.error(
      JSON.stringify({ event: 'api_domain_lookup_failed', hostname }),
      error
    )
    return null
  }
}

/**
 * Converts an api-media short link into the routing record api-media would
 * have published. Retired links are a miss (their edge keys are deleted).
 * `status` and `fallbackTo` are the link's own overrides only, never the
 * owning domain's defaults, so a global link served on another domain takes
 * that domain's status.
 *
 * Brightcove passthrough rule (TECH-DESIGN.md, "Routing record"): an arc.gt
 * link carrying `brightcoveId` + `redirectType` keeps `to = <passthroughOrigin>/<pathname>`
 * so the Arclight API resolves the Brightcove URL exactly as it does today.
 */
export function toRoutingRecord(
  link: ShortLinkByPathData,
  domain: Pick<DomainRecord, 'passthroughOrigin'>,
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
    status: link.redirectStatus ?? null,
    fallbackTo: link.fallbackTo ?? null,
    paused: link.status === 'paused',
    assetClass: link.assetClass,
    placement: link.placement ?? null,
    campaignIds: (link.campaigns ?? []).map((campaign) => campaign.id),
    videoId: link.videoId ?? null,
    youtubeVideoId: link.youtubeVideoId ?? null,
    language: link.language ?? null,
    global: link.global === true,
    hostname: link.domain?.hostname ?? ''
  }
}
