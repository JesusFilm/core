import axios, { isAxiosError } from 'axios'
import { GraphQLError, GraphQLResolveInfo } from 'graphql'
import camelCase from 'lodash/camelCase'
import get from 'lodash/get'
import reduce from 'lodash/reduce'

import { Action, ability, subject } from '../../lib/auth/ability'
import { builder } from '../builder'
import { IdType } from '../journey/enums'

import { PlausibleStatsAggregateFilter } from './inputs'
import { loadJourneyOrThrow, normalizeIdType } from './journeyAccess'
import { getMetrics } from './metrics'
import {
  PlausibleStatsAggregateResponse,
  PlausibleStatsAggregateResponseRef
} from './plausible'
import { buildJourneySiteId, getPlausibleConfig } from './service'

type PlausibleAggregateParams = {
  metrics: string
} & typeof PlausibleStatsAggregateFilter.$inferInput

builder.queryField('journeysPlausibleStatsAggregate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: PlausibleStatsAggregateResponseRef,
    nullable: false,
    args: {
      where: t.arg({
        type: PlausibleStatsAggregateFilter,
        required: true
      }),
      id: t.arg.id({ required: true }),
      idType: t.arg({
        type: IdType,
        required: false,
        defaultValue: 'slug'
      })
    },
    resolve: async (
      _parent,
      { id, idType, where },
      context,
      info: GraphQLResolveInfo
    ): Promise<PlausibleStatsAggregateResponse> => {
      const journey = await loadJourneyOrThrow(id, normalizeIdType(idType))

      if (!ability(Action.Update, subject('Journey', journey), context.user)) {
        throw new GraphQLError('User is not allowed to view journey', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      const metrics = getMetrics(info)
      const params: PlausibleAggregateParams = { metrics, ...where }

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
            site_id: buildJourneySiteId(journey.id),
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
  })
)
