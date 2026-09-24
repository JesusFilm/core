import { PlausibleStatsResponse } from '../../plausible/plausible'
import {
  buildTeamSiteId,
  getJourneyStatsBreakdown
} from '../../plausible/service'

export interface CampaignCountryStat {
  countryCode: string
  countryName: string | null
  visitors: number
  pageviews: number
}

export interface CampaignCountryStats {
  from: Date
  to: Date
  totalVisitors: number
  totalPageviews: number
  countries: CampaignCountryStat[]
}

// Anonymous requests must not pin on a hung Plausible connection for the
// service default of 30s.
const PUBLIC_STATS_TIMEOUT_MS = 10000
// There are fewer than 250 ISO country codes; one page covers every row.
const COUNTRY_ROW_LIMIT = 300

const regionNames = (() => {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' })
  } catch {
    return null
  }
})()

export function resolveCountryName(countryCode: string): string | null {
  if (regionNames == null) return null
  try {
    return regionNames.of(countryCode) ?? null
  } catch {
    // RangeError for codes Intl does not recognise (e.g. Plausible's "XK").
    return null
  }
}

/**
 * Plausible v1 filter selecting every pageview of the given journeys. Journey
 * pageviews are recorded with page path `/<journeyId>/<stepId>` on the team
 * site, so a prefix wildcard per journey, OR-ed with `|`, isolates the
 * campaign's traffic in a single request.
 */
export function buildCampaignPageFilter(journeyIds: readonly string[]): string {
  return `event:page==${journeyIds.map((id) => `/${id}/**`).join('|')}`
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function metric(
  row: PlausibleStatsResponse,
  key: 'visitors' | 'pageviews'
): number {
  const value = (row as unknown as Record<string, unknown>)[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

interface GetCampaignCountryStatsArgs {
  teamId: string
  journeyIds: readonly string[]
  statsFrom: Date
  now?: Date
}

/**
 * Country-level view counts across a campaign's share journeys.
 *
 * ONE Plausible call against the TEAM site (`api-journeys-team-<teamId>`) —
 * every public journey pageview is sent to the journey site AND the team site
 * (see JourneyPageWrapper in apps/journeys), and all campaign journeys are
 * same-team by construction. This sidesteps a per-journey fan-out that would
 * hit Plausible's ~100 req/60s burst limit for a campaign with many language
 * journeys, and de-duplicates visitors who viewed more than one journey.
 *
 * Rows with an empty country (unknown geo) are excluded from `countries` but
 * still counted in the totals.
 */
export async function getCampaignCountryStats({
  teamId,
  journeyIds,
  statsFrom,
  now = new Date()
}: GetCampaignCountryStatsArgs): Promise<CampaignCountryStats> {
  const to = now
  const from = statsFrom.getTime() > now.getTime() ? now : statsFrom
  if (journeyIds.length === 0) {
    return { from, to, totalVisitors: 0, totalPageviews: 0, countries: [] }
  }

  const rows = await getJourneyStatsBreakdown(
    '',
    {
      property: 'visit:country',
      metrics: 'visitors,pageviews',
      period: 'custom',
      date: `${toDateString(from)},${toDateString(to)}`,
      filters: buildCampaignPageFilter(journeyIds),
      limit: COUNTRY_ROW_LIMIT
    },
    buildTeamSiteId(teamId),
    { timeoutMs: PUBLIC_STATS_TIMEOUT_MS }
  )

  let totalVisitors = 0
  let totalPageviews = 0
  const countries: CampaignCountryStat[] = []
  for (const row of rows) {
    const visitors = metric(row, 'visitors')
    const pageviews = metric(row, 'pageviews')
    totalVisitors += visitors
    totalPageviews += pageviews
    const countryCode = (row.property ?? '').trim().toUpperCase()
    if (countryCode === '') continue
    countries.push({
      countryCode,
      countryName: resolveCountryName(countryCode),
      visitors,
      pageviews
    })
  }
  countries.sort(
    (a, b) =>
      b.visitors - a.visitors || a.countryCode.localeCompare(b.countryCode)
  )

  return { from, to, totalVisitors, totalPageviews, countries }
}
