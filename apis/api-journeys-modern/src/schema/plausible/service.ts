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

  try {
    const response = await axios.get<{
      results: Array<Record<string, number | string | null>>
    }>(endpoint, {
      headers,
      params: {
        site_id: siteId ?? buildJourneySiteId(journeyId),
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
