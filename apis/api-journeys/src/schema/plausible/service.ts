import axios, { isAxiosError } from 'axios'
import { GraphQLError } from 'graphql'
import camelCase from 'lodash/camelCase'
import get from 'lodash/get'
import reduce from 'lodash/reduce'

import { env } from '../../env'

import { PlausibleStatsBreakdownFilter } from './inputs'
import { PlausibleStatsResponse } from './plausible'

type PlausibleBreakdownParams = {
  metrics: string
} & typeof PlausibleStatsBreakdownFilter.$inferInput

// Plausible's breakdown endpoint caps `limit` at 1000 rows per page. To fetch
// more, callers must paginate with `page=1,2,…`. See
// https://plausible.io/docs/stats-api#get-apiv1statsbreakdown
const PLAUSIBLE_MAX_BREAKDOWN_LIMIT = 1000

// Safety bound on auto-pagination. The loop normally stops when a short page is
// returned; this guards against a runaway loop (e.g. if Plausible ignores the
// `page` param and keeps returning full pages) capping the fetch at 50k rows.
// 50 is also a deliberate ceiling against Plausible's rate limits: a report
// issues up to this many pages per breakdown (and templateFamilyStatsBreakdown
// runs two), so ~100 sequential calls already sits at Plausible cloud's
// ~100 req/60s burst limit (600/hr per team). Raising it trades a rare tail
// truncation for 429s. Truncation is logged below rather than surfaced.
const PLAUSIBLE_MAX_BREAKDOWN_PAGES = 50

// Per-request timeout. A paginated report can issue many sequential calls, so a
// single hung connection must not block the resolver indefinitely.
const PLAUSIBLE_REQUEST_TIMEOUT_MS = 30000

type PlausibleBreakdownRow = Record<string, number | string | null>

export function buildJourneySiteId(journeyId: string): string {
  return `api-journeys-journey-${journeyId}`
}

export function getPlausibleConfig(): {
  baseUrl: string
  headers: Record<string, string>
} {
  return {
    baseUrl: env.PLAUSIBLE_URL,
    headers: {
      Authorization: `Bearer ${env.PLAUSIBLE_API_KEY}`
    }
  }
}

interface GetJourneyStatsBreakdownOptions {
  /**
   * When true, page through the entire breakdown (every row) instead of making
   * a single request. Plausible returns only the top 100 rows by default, which
   * silently drops low-volume rows (e.g. capture conversions) from reports that
   * aggregate across many journeys. Defaults to false so callers that want a
   * single bounded request (e.g. per-journey analytics) keep their behavior.
   */
  paginate?: boolean
}

export async function getJourneyStatsBreakdown(
  journeyId: string,
  params: PlausibleBreakdownParams,
  siteId?: string,
  { paginate = false }: GetJourneyStatsBreakdownOptions = {}
): Promise<PlausibleStatsResponse[]> {
  const { baseUrl, headers } = getPlausibleConfig()
  const endpoint = `${baseUrl}/api/v1/stats/breakdown`
  const resolvedSiteId = siteId ?? buildJourneySiteId(journeyId)
  const propertyKey = params.property?.split(':').pop() ?? ''

  const requestRows = async (
    overrides: Record<string, number> = {}
  ): Promise<PlausibleBreakdownRow[]> => {
    const response = await axios.get<{ results: PlausibleBreakdownRow[] }>(
      endpoint,
      {
        headers,
        timeout: PLAUSIBLE_REQUEST_TIMEOUT_MS,
        params: {
          site_id: resolvedSiteId,
          ...params,
          ...overrides
        }
      }
    )
    return response.data?.results ?? []
  }

  const toStatsResponse = (
    row: PlausibleBreakdownRow
  ): PlausibleStatsResponse => {
    const propertyValue = (row[propertyKey] as string) ?? ''
    const accumulator: PlausibleStatsResponse = {
      property: propertyValue
    }
    return reduce(
      row,
      (acc, value, key) => {
        if (key !== propertyKey) {
          ;(acc as unknown as Record<string, number | null>)[camelCase(key)] =
            (value as number | null) ?? null
        }
        return acc
      },
      accumulator
    )
  }

  try {
    // Default: a single request that passes the caller's params through
    // unchanged (Plausible applies its own default limit). Used for bounded,
    // per-journey queries that must not fan out into many calls.
    if (!paginate) {
      const rows = await requestRows()
      return rows.map(toStatsResponse)
    }

    // Reports page through every row. Force the max page size and ignore any
    // caller limit/page. De-dupe by the breakdown's property value so that a
    // page-ignoring or unstable upstream cannot re-send rows and inflate the
    // downstream per-event sums; stop on a short page, a page that adds nothing
    // new, or the page cap.
    const seen = new Set<string>()
    const allRows: PlausibleBreakdownRow[] = []
    let page = 1
    let cappedWithMore = false
    for (; page <= PLAUSIBLE_MAX_BREAKDOWN_PAGES; page++) {
      const rows = await requestRows({
        limit: PLAUSIBLE_MAX_BREAKDOWN_LIMIT,
        page
      })
      let newRows = 0
      for (const row of rows) {
        const rowKey = String(row[propertyKey] ?? '')
        if (seen.has(rowKey)) continue
        seen.add(rowKey)
        allRows.push(row)
        newRows++
      }
      if (rows.length < PLAUSIBLE_MAX_BREAKDOWN_LIMIT || newRows === 0) break
      if (page === PLAUSIBLE_MAX_BREAKDOWN_PAGES) cappedWithMore = true
    }
    if (cappedWithMore) {
      console.error(
        '[getJourneyStatsBreakdown] hit max page cap; results may be truncated',
        { siteId: resolvedSiteId, property: params.property }
      )
    }
    return allRows.map(toStatsResponse)
  } catch (error) {
    if (isAxiosError(error)) {
      const message = get(error, 'response.data.error')
      if (typeof message === 'string') {
        throw new GraphQLError(message, {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }
    }
    throw error
  }
}
