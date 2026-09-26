import type { Placement, RoutingRecord } from './records'
import type { ResolvedFrom } from './resolve'

export type Attribution = 'qr' | 'direct' | 'unknown'

/** The queue message (prds/short-links/TECH-DESIGN.md, "Queue message"). */
export interface RedirectEvent {
  v: 1
  ts: string
  hostname: string
  pathname: string
  linkId: string
  campaignIds: string[]
  videoId: string | null
  youtubeVideoId: string | null
  placement: Placement | null
  destination: string
  status: number
  attribution: Attribution
  country: string | null
  /** Consumed by the queue consumer to derive device class / OS / browser, then dropped. */
  userAgent: string
  referrerHost: string | null
  language: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  resolvedFrom: ResolvedFrom
}

export interface BuildRedirectEventInput {
  hostname: string
  pathname: string
  record: RoutingRecord
  destination: string
  status: number
  resolvedFrom: ResolvedFrom
  searchParams: URLSearchParams
  headers: Headers
  country: string | null | undefined
  now?: Date
}

/** Pure: builds the queue message from the request and the resolved record. */
export function buildRedirectEvent({
  hostname,
  pathname,
  record,
  destination,
  status,
  resolvedFrom,
  searchParams,
  headers,
  country,
  now = new Date()
}: BuildRedirectEventInput): RedirectEvent {
  const userAgent = headers.get('user-agent') ?? ''
  const referer = headers.get('referer')

  return {
    v: 1,
    ts: now.toISOString(),
    hostname,
    pathname,
    linkId: record.id,
    campaignIds: record.campaignIds,
    videoId: record.videoId ?? null,
    youtubeVideoId: record.youtubeVideoId ?? null,
    placement: record.placement ?? null,
    destination,
    status,
    attribution: attributionFor(searchParams, userAgent),
    country: country == null || country === '' ? null : country,
    userAgent,
    referrerHost: referrerHostFrom(referer),
    language: firstLanguageTag(headers.get('accept-language')),
    utmSource: searchParams.get('utm_source'),
    utmMedium: searchParams.get('utm_medium'),
    utmCampaign: searchParams.get('utm_campaign'),
    resolvedFrom
  }
}

function attributionFor(
  searchParams: URLSearchParams,
  userAgent: string
): Attribution {
  if (searchParams.has('qr')) return 'qr'
  if (userAgent.trim() === '') return 'unknown'
  return 'direct'
}

export function referrerHostFrom(referer: string | null): string | null {
  if (referer == null || referer === '') return null
  try {
    const hostname = new URL(referer).hostname
    return hostname === '' ? null : hostname
  } catch {
    return null
  }
}

export function firstLanguageTag(acceptLanguage: string | null): string | null {
  if (acceptLanguage == null) return null
  const first = acceptLanguage.split(',')[0]?.split(';')[0]?.trim() ?? ''
  if (first === '' || first === '*') return null
  return first
}

/**
 * Runtime check used by the queue consumer so a foreign or future-shaped
 * message is dropped rather than turned into a malformed ClickHouse row.
 */
export function isRedirectEvent(value: unknown): value is RedirectEvent {
  if (typeof value !== 'object' || value == null) return false
  const candidate = value as Record<string, unknown>
  return (
    candidate.v === 1 &&
    typeof candidate.ts === 'string' &&
    typeof candidate.hostname === 'string' &&
    typeof candidate.pathname === 'string' &&
    typeof candidate.linkId === 'string' &&
    Array.isArray(candidate.campaignIds) &&
    typeof candidate.destination === 'string' &&
    typeof candidate.status === 'number' &&
    typeof candidate.attribution === 'string' &&
    typeof candidate.userAgent === 'string' &&
    typeof candidate.resolvedFrom === 'string'
  )
}
