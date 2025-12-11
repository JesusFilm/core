import axios, { isAxiosError } from 'axios'
import { GraphQLError, GraphQLResolveInfo } from 'graphql'
import camelCase from 'lodash/camelCase'
import get from 'lodash/get'
import reduce from 'lodash/reduce'

import { Action, ability, subject } from '../../lib/auth/ability'
import { builder } from '../builder'
import { IdType } from '../journey/enums'

import { PlausibleStatsTimeseriesFilter } from './inputs'
import { loadJourneyOrThrow, normalizeIdType } from './journeyAccess'
import { getMetrics } from './metrics'
import type { PlausibleStatsResponse } from './plausible'
import { PlausibleStatsResponseRef } from './plausible'
import { buildJourneySiteId, getPlausibleConfig } from './service'

type PlausibleTimeseriesParams = {
  metrics: string
} & typeof PlausibleStatsTimeseriesFilter.$inferInput

builder.queryField('journeysPlausibleStatsTimeseries', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [PlausibleStatsResponseRef],
    nullable: false,
    description:
      'This endpoint provides timeseries data over a certain time period.\nIf you are familiar with the Plausible dashboard, this endpoint corresponds to the main visitor graph.',
    args: {
      where: t.arg({
        type: PlausibleStatsTimeseriesFilter,
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
    ): Promise<PlausibleStatsResponse[]> => {
      const journey = await loadJourneyOrThrow(id, normalizeIdType(idType))

      if (!ability(Action.Update, subject('Journey', journey), context.user)) {
        throw new GraphQLError('User is not allowed to view journey', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      const metrics = getMetrics(info)
      const params: PlausibleTimeseriesParams = {
        metrics,
        ...where
      }

      const { baseUrl, headers } = getPlausibleConfig()
      const endpoint = `${baseUrl}/api/v1/stats/timeseries`

      try {
        const response = await axios.get<{
          results: Array<Record<string, number | string | null>>
        }>(endpoint, {
          headers,
          params: {
            site_id: buildJourneySiteId(journey.id),
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
                ;(acc as unknown as Record<string, number | null>)[
                  camelCase(key)
                ] = (value as number | null) ?? null
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
  })
)
