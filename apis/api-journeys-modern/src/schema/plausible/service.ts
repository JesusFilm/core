import axios, { isAxiosError } from 'axios'
import { GraphQLError } from 'graphql'
import camelCase from 'lodash/camelCase'
import get from 'lodash/get'
import reduce from 'lodash/reduce'

import { getPlausibleEnv } from '../../env'

import {
  PlausibleStatsAggregateFilter,
  PlausibleStatsBreakdownFilter,
  PlausibleStatsTimeseriesFilter
} from './inputs'
import {
  PlausibleStatsAggregateResponse,
  PlausibleStatsResponse
} from './plausible'

type PlausibleStatsAggregateFilterInput =
  typeof PlausibleStatsAggregateFilter.$inferInput

type PlausibleAggregateParams = {
  metrics: string
} & PlausibleStatsAggregateFilterInput

type PlausibleBreakdownParams = {
  metrics: string
} & typeof PlausibleStatsBreakdownFilter.$inferInput

type PlausibleTimeseriesParams = {
  metrics: string
} & typeof PlausibleStatsTimeseriesFilter.$inferInput

interface PlausibleConfig {
  baseUrl: string
  headers: Record<string, string>
}

function sanitizeBaseUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

function buildJourneySiteId(journeyId: string): string {
  return `api-journeys-journey-${journeyId}`
}

function getPlausibleConfig(): PlausibleConfig {
  const credentials = getPlausibleEnv()

  if (credentials == null) {
    throw new GraphQLError('Plausible is not configured', {
      extensions: { code: 'INTERNAL_SERVER_ERROR' }
    })
  }

  return {
    baseUrl: sanitizeBaseUrl(credentials.PLAUSIBLE_URL),
    headers: {
      Authorization: `Bearer ${credentials.PLAUSIBLE_API_KEY}`
    }
  }
}

export async function getJourneyRealtimeVisitors(
  journeyId: string
): Promise<number> {
  const { baseUrl, headers } = getPlausibleConfig()
  const endpoint = `${baseUrl}/api/v1/stats/realtime/visitors`

  try {
    const response = await axios.get<number>(endpoint, {
      headers,
      params: {
        site_id: buildJourneySiteId(journeyId)
      }
    })

    return response.data
  } catch (error) {
    if (isAxiosError(error)) {
      const data = error.response?.data
      const message =
        typeof data === 'string'
          ? data
          : typeof data?.error === 'string'
            ? data.error
            : (error.message ?? 'Failed to fetch Plausible visitors')

      throw new GraphQLError(message, {
        extensions: {
          code: 'BAD_GATEWAY'
        }
      })
    }
    throw error
  }
}

export async function getJourneyStatsAggregate(
  journeyId: string,
  params: PlausibleAggregateParams
): Promise<PlausibleStatsAggregateResponse> {
  const { baseUrl, headers } = getPlausibleConfig()
  const endpoint = `${baseUrl}/api/v1/stats/aggregate`

  try {
    const response = await axios.get<{
      results: Record<
        string,
        { value: number; change?: number | null } | undefined
      >
    }>(endpoint, {
      headers,
      params: {
        site_id: buildJourneySiteId(journeyId),
        ...params
      }
    })

    const accumulator: Record<
      string,
      { value: number; change?: number | null }
    > = {}
    const normalized = reduce(
      response.data?.results ?? {},
      (acc, value, key) => {
        if (value != null) {
          acc[camelCase(key)] = value
        }
        return acc
      },
      accumulator
    )
    return normalized as PlausibleStatsAggregateResponse
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

export async function getJourneyStatsBreakdown(
  journeyId: string,
  params: PlausibleBreakdownParams
): Promise<PlausibleStatsResponse[]> {
  const { baseUrl, headers } = getPlausibleConfig()
  const endpoint = `${baseUrl}/api/v1/stats/breakdown`

  try {
    const response = await axios.get<{
      results: Array<Record<string, number | string | null>>
    }>(endpoint, {
      headers,
      params: {
        site_id: buildJourneySiteId(journeyId),
        ...params
      }
    })

    const propertyKey = params.property?.split(':').pop() ?? ''
    return (response.data?.results ?? []).map((result) => {
      const propertyValue = (result[propertyKey] as string) ?? ''
      const accumulator: PlausibleStatsResponse = {
        property: propertyValue
      }
      return reduce(
        result,
        (acc, value, key) => {
          if (key !== propertyKey) {
            ;(acc as unknown as Record<string, number | null>)[camelCase(key)] =
              (value as number | null) ?? null
          }
          return acc
        },
        accumulator
      )
    })
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

export async function getJourneyStatsTimeseries(
  journeyId: string,
  params: PlausibleTimeseriesParams
): Promise<PlausibleStatsResponse[]> {
  const { baseUrl, headers } = getPlausibleConfig()
  const endpoint = `${baseUrl}/api/v1/stats/timeseries`

  try {
    const response = await axios.get<{
      results: Array<Record<string, number | string | null>>
    }>(endpoint, {
      headers,
      params: {
        site_id: buildJourneySiteId(journeyId),
        ...params
      }
    })

    return (response.data?.results ?? []).map((result) => {
      const accumulator: PlausibleStatsResponse = {
        property: (result.date as string) ?? ''
      }
      return reduce(
        result,
        (acc, value, key) => {
          if (key !== 'date') {
            ;(acc as unknown as Record<string, number | null>)[camelCase(key)] =
              (value as number | null) ?? null
          }
          return acc
        },
        accumulator
      )
    })
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
