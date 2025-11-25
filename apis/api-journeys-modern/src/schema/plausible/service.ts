import axios, { isAxiosError } from 'axios'
import { GraphQLError } from 'graphql'

function sanitizeBaseUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

function buildJourneySiteId(journeyId: string): string {
  return `api-journeys-journey-${journeyId}`
}

export async function getJourneyRealtimeVisitors(
  journeyId: string
): Promise<number> {
  const plausibleUrl = process.env.PLAUSIBLE_URL
  const plausibleApiKey = process.env.PLAUSIBLE_API_KEY

  if (!plausibleUrl || !plausibleApiKey) {
    throw new GraphQLError('Plausible is not configured', {
      extensions: { code: 'INTERNAL_SERVER_ERROR' }
    })
  }

  const endpoint = `${sanitizeBaseUrl(
    plausibleUrl
  )}/api/v1/stats/realtime/visitors`

  try {
    const response = await axios.get<number>(endpoint, {
      headers: {
        Authorization: `Bearer ${plausibleApiKey}`
      },
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
