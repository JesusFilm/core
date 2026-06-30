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

export async function getJourneyStatsBreakdown(
  journeyId: string,
  params: PlausibleBreakdownParams,
  siteId?: string
): Promise<PlausibleStatsResponse[]> {
  const { baseUrl, headers } = getPlausibleConfig()
  const endpoint = `${baseUrl}/api/v1/stats/breakdown`
  const resolvedSiteId = siteId ?? buildJourneySiteId(journeyId)
  const propertyKey = params.property?.split(':').pop() ?? ''

  const fetchPage = async (
    page: number,
    limit: number
  ): Promise<PlausibleBreakdownRow[]> => {
    const response = await axios.get<{ results: PlausibleBreakdownRow[] }>(
      endpoint,
      {
        headers,
        params: {
          site_id: resolvedSiteId,
          ...params,
          limit,
          page
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
    // When the caller pins a specific limit or page, honor it with a single
    // request — they are intentionally asking for a bounded slice of results.
    if (params.limit != null || params.page != null) {
      const rows = await fetchPage(
        params.page ?? 1,
        params.limit ?? PLAUSIBLE_MAX_BREAKDOWN_LIMIT
      )
      return rows.map(toStatsResponse)
    }

    // Otherwise page through every result. Plausible returns only the top 100
    // rows by default, so low-volume rows (e.g. capture conversions) silently
    // drop off as a site accumulates data. Loop with the max page size until a
    // short page signals the last one.
    const allRows: PlausibleBreakdownRow[] = []
    let page = 1
    for (;;) {
      const rows = await fetchPage(page, PLAUSIBLE_MAX_BREAKDOWN_LIMIT)
      allRows.push(...rows)
      if (rows.length < PLAUSIBLE_MAX_BREAKDOWN_LIMIT) break
      page += 1
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
