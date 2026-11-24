import type { Env } from './env'
import { type RedirectEvent, isRedirectEvent } from './event'
import { classifyUserAgent } from './userAgent'

export const DEFAULT_CLICKHOUSE_DATABASE = 'redirects'

/** One `redirects.redirect_events` row (`clickhouse/0001_init.sql`). */
export interface RedirectEventRow {
  ts: string
  hostname: string
  pathname: string
  link_id: string
  campaign_ids: string[]
  video_id: string | null
  youtube_video_id: string | null
  placement: string | null
  destination: string
  status: number
  attribution: string
  country: string | null
  device_class: string
  os: string
  browser: string
  referrer_host: string | null
  language: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  resolved_from: string
  /** UInt8: 1 for a global link. */
  global: number
  owner_hostname: string
}

/** `2026-09-26T10:00:00.000Z` -> `2026-09-26 10:00:00.000` (DateTime64(3, 'UTC')). */
export function toClickHouseTimestamp(
  iso: string,
  fallback = new Date()
): string {
  const parsed = new Date(iso)
  const date = Number.isNaN(parsed.getTime()) ? fallback : parsed
  return date.toISOString().replace('T', ' ').replace('Z', '')
}

/** Pure: maps a queue message to a row. The user agent is parsed, then dropped. */
export function toRedirectEventRow(event: RedirectEvent): RedirectEventRow {
  const { deviceClass, os, browser } = classifyUserAgent(event.userAgent)
  return {
    ts: toClickHouseTimestamp(event.ts),
    hostname: event.hostname,
    pathname: event.pathname,
    link_id: event.linkId,
    campaign_ids: event.campaignIds,
    video_id: event.videoId ?? null,
    youtube_video_id: event.youtubeVideoId ?? null,
    placement: event.placement ?? null,
    destination: event.destination,
    status: event.status,
    attribution: event.attribution,
    country: event.country ?? null,
    device_class: deviceClass,
    os,
    browser,
    referrer_host: event.referrerHost ?? null,
    language: event.language ?? null,
    utm_source: event.utmSource ?? null,
    utm_medium: event.utmMedium ?? null,
    utm_campaign: event.utmCampaign ?? null,
    resolved_from: event.resolvedFrom,
    global: event.global === true ? 1 : 0,
    owner_hostname: event.ownerHostname ?? ''
  }
}

/** Without trailing slashes; a loop rather than `/\/+$/`, which is quadratic on long runs of `/`. */
function stripTrailingSlashes(value: string): string {
  let end = value.length
  while (end > 0 && value[end - 1] === '/') end -= 1
  return value.slice(0, end)
}

export function insertUrl(clickhouseUrl: string, database: string): string {
  const query = `INSERT INTO ${database}.redirect_events FORMAT JSONEachRow`
  return `${stripTrailingSlashes(clickhouseUrl)}/?query=${encodeURIComponent(query)}`
}

function basicAuthHeader(user: string, password: string): string {
  return `Basic ${btoa(`${user}:${password}`)}`
}

/**
 * Queue consumer: batches messages into ClickHouse over HTTP. Acks the whole
 * batch on 2xx, retries the whole batch on anything else, and when no
 * ClickHouse is configured acks-and-drops (logged once per batch) so local and
 * stage environments without analytics never build a backlog.
 */
export async function handleQueueBatch(
  batch: MessageBatch<unknown>,
  env: Env
): Promise<void> {
  const clickhouseUrl = env.CLICKHOUSE_URL ?? ''
  if (clickhouseUrl === '') {
    console.log(
      JSON.stringify({
        event: 'clickhouse_unconfigured',
        dropped: batch.messages.length
      })
    )
    batch.ackAll()
    return
  }

  const rows: RedirectEventRow[] = []
  let malformed = 0
  for (const message of batch.messages) {
    if (!isRedirectEvent(message.body)) {
      malformed += 1
      continue
    }
    rows.push(toRedirectEventRow(message.body))
  }
  if (malformed > 0) {
    console.error(
      JSON.stringify({ event: 'malformed_redirect_event', malformed })
    )
  }
  if (rows.length === 0) {
    batch.ackAll()
    return
  }

  const database = env.CLICKHOUSE_DATABASE ?? DEFAULT_CLICKHOUSE_DATABASE
  const body = rows.map((row) => JSON.stringify(row)).join('\n') + '\n'

  try {
    const response = await fetch(insertUrl(clickhouseUrl, database), {
      method: 'POST',
      headers: {
        Authorization: basicAuthHeader(
          env.CLICKHOUSE_USER ?? '',
          env.CLICKHOUSE_PASSWORD ?? ''
        ),
        'Content-Type': 'text/plain; charset=utf-8'
      },
      body
    })

    if (!response.ok) {
      console.error(
        JSON.stringify({
          event: 'clickhouse_insert_failed',
          status: response.status,
          rows: rows.length,
          detail: (await response.text()).slice(0, 500)
        })
      )
      batch.retryAll()
      return
    }

    batch.ackAll()
  } catch (error) {
    console.error(
      JSON.stringify({ event: 'clickhouse_insert_failed', rows: rows.length }),
      error
    )
    batch.retryAll()
  }
}
