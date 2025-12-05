import axios, { isAxiosError } from 'axios'
import { GraphQLError } from 'graphql'

import { env } from '../../env'

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
  return {
    baseUrl: sanitizeBaseUrl(env.PLAUSIBLE_URL),
    headers: {
      Authorization: `Bearer ${env.PLAUSIBLE_API_KEY}`
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
