import {
  ClickHouseConfig,
  ClickHouseParams,
  clickHouseQuery,
  getClickHouseConfig
} from './clickhouse'

export interface ShortLinkStatsFilterInput {
  linkId?: string | null
  campaignId?: string | null
  hostname?: string | null
  videoId?: string | null
  youtubeVideoId?: string | null
  from: Date
  to: Date
}

export interface ShortLinkStatsPoint {
  key: string
  count: number
  qrCount: number
}

export interface ShortLinkStats {
  total: number
  qr: number
  direct: number
  byDay: ShortLinkStatsPoint[]
  byLink: ShortLinkStatsPoint[]
  byCampaign: ShortLinkStatsPoint[]
  byCountry: ShortLinkStatsPoint[]
  byDeviceClass: ShortLinkStatsPoint[]
  byPlacement: ShortLinkStatsPoint[]
  byReferrerHost: ShortLinkStatsPoint[]
  byAttribution: ShortLinkStatsPoint[]
}

const BREAKDOWN_LIMIT = 50
const TABLE = 'redirect_events'

export function emptyShortLinkStats(): ShortLinkStats {
  return {
    total: 0,
    qr: 0,
    direct: 0,
    byDay: [],
    byLink: [],
    byCampaign: [],
    byCountry: [],
    byDeviceClass: [],
    byPlacement: [],
    byReferrerHost: [],
    byAttribution: []
  }
}

interface WhereClause {
  sql: string
  params: ClickHouseParams
}

/**
 * The WHERE clause is assembled from fixed fragments only; every value goes
 * through a named parameter.
 */
export function buildWhere(filter: ShortLinkStatsFilterInput): WhereClause {
  const conditions = [
    'ts >= parseDateTime64BestEffort({from:String}, 3)',
    'ts < parseDateTime64BestEffort({to:String}, 3)'
  ]
  const params: ClickHouseParams = {
    from: filter.from.toISOString(),
    to: filter.to.toISOString()
  }
  if (filter.linkId != null) {
    conditions.push('link_id = {linkId:String}')
    params.linkId = filter.linkId
  }
  if (filter.campaignId != null) {
    conditions.push('has(campaign_ids, {campaignId:String})')
    params.campaignId = filter.campaignId
  }
  if (filter.hostname != null) {
    conditions.push('hostname = {hostname:String}')
    params.hostname = filter.hostname.toLowerCase()
  }
  if (filter.videoId != null) {
    conditions.push('video_id = {videoId:String}')
    params.videoId = filter.videoId
  }
  if (filter.youtubeVideoId != null) {
    conditions.push('youtube_video_id = {youtubeVideoId:String}')
    params.youtubeVideoId = filter.youtubeVideoId
  }
  return { sql: conditions.join(' AND '), params }
}

interface TotalsRow {
  total: string | number
  qr: string | number
}

interface PointRow {
  key: string
  count: string | number
  qrCount: string | number
}

// ClickHouse quotes 64-bit integers in JSON output by default.
function toNumber(value: string | number): number {
  return typeof value === 'number' ? value : Number(value)
}

function toPoints(rows: PointRow[]): ShortLinkStatsPoint[] {
  return rows.map((row) => ({
    key: row.key,
    count: toNumber(row.count),
    qrCount: toNumber(row.qrCount)
  }))
}

const COUNT_COLUMNS = "count() AS count, countIf(attribution = 'qr') AS qrCount"

async function breakdown(
  config: ClickHouseConfig,
  where: WhereClause,
  keyExpression: string,
  options: { orderBy: 'count' | 'key'; limit: number | null }
): Promise<ShortLinkStatsPoint[]> {
  const order = options.orderBy === 'count' ? 'count DESC, key ASC' : 'key ASC'
  const limit = options.limit != null ? ` LIMIT ${options.limit}` : ''
  const rows = await clickHouseQuery<PointRow>(
    config,
    `SELECT ${keyExpression} AS key, ${COUNT_COLUMNS} FROM ${TABLE} WHERE ${where.sql} GROUP BY key ORDER BY ${order}${limit}`,
    where.params
  )
  return toPoints(rows)
}

export async function getShortLinkStats(
  filter: ShortLinkStatsFilterInput
): Promise<ShortLinkStats> {
  const config = getClickHouseConfig()
  if (config == null) return emptyShortLinkStats()

  const where = buildWhere(filter)
  const top = { orderBy: 'count' as const, limit: BREAKDOWN_LIMIT }

  const [
    totals,
    byDay,
    byLink,
    byCampaign,
    byCountry,
    byDeviceClass,
    byPlacement,
    byReferrerHost,
    byAttribution
  ] = await Promise.all([
    clickHouseQuery<TotalsRow>(
      config,
      `SELECT count() AS total, countIf(attribution = 'qr') AS qr FROM ${TABLE} WHERE ${where.sql}`,
      where.params
    ),
    breakdown(config, where, 'toString(toDate(ts))', {
      orderBy: 'key',
      limit: null
    }),
    breakdown(config, where, 'link_id', top),
    breakdown(config, where, 'arrayJoin(campaign_ids)', top),
    breakdown(config, where, "ifNull(country, 'unknown')", top),
    breakdown(config, where, 'device_class', top),
    breakdown(config, where, "ifNull(placement, 'unknown')", top),
    breakdown(config, where, "ifNull(referrer_host, 'direct')", top),
    breakdown(config, where, 'attribution', top)
  ])

  const total = totals[0] != null ? toNumber(totals[0].total) : 0
  const qr = totals[0] != null ? toNumber(totals[0].qr) : 0

  return {
    total,
    qr,
    direct: total - qr,
    byDay,
    byLink,
    byCampaign,
    byCountry,
    byDeviceClass,
    byPlacement,
    byReferrerHost,
    byAttribution
  }
}
