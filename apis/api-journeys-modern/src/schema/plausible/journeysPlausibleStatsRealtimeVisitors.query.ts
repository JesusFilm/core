import axios, { isAxiosError } from 'axios'
import { GraphQLError } from 'graphql'

import { Action, ability, subject } from '../../lib/auth/ability'
import { builder } from '../builder'
import { IdType } from '../journey/enums'

import { loadJourneyOrThrow, normalizeIdType } from './journeyAccess'
import { buildJourneySiteId, getPlausibleConfig } from './service'

builder.queryField('journeysPlausibleStatsRealtimeVisitors', (t) =>
  t.withAuth({ isAuthenticated: true }).int({
    args: {
      id: t.arg.id({ required: true }),
      idType: t.arg({
        type: IdType,
        required: false,
        defaultValue: 'slug'
      })
    },
    resolve: async (_parent, { id, idType }, context) => {
      const journey = await loadJourneyOrThrow(id, normalizeIdType(idType))

      if (!ability(Action.Update, subject('Journey', journey), context.user)) {
        throw new GraphQLError('User is not allowed to view journey', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      const { baseUrl, headers } = getPlausibleConfig()
      const endpoint = `${baseUrl}/api/v1/stats/realtime/visitors`

      try {
        const response = await axios.get<number>(endpoint, {
          headers,
          params: {
            site_id: buildJourneySiteId(journey.id)
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
  })
)
