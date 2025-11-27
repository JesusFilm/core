import { GraphQLError, GraphQLResolveInfo } from 'graphql'

import { Action, ability, subject } from '../../lib/auth/ability'
import { builder } from '../builder'
import { IdType } from '../journey/enums'

import { PlausibleStatsTimeseriesFilter } from './inputs'
import { loadJourneyOrThrow, normalizeIdType } from './journeyAccess'
import { getMetrics } from './metrics'
import { PlausibleStatsResponseRef } from './plausible'
import { getJourneyStatsTimeseries } from './service'

builder.queryField('journeysPlausibleStatsTimeseries', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [PlausibleStatsResponseRef],
    description:
      'This endpoint provides timeseries data over a certain time period.\nIf you are familiar with the Plausible dashboard, this endpoint corresponds to the main visitor graph.',
    args: {
      id: t.arg.id({ required: true }),
      idType: t.arg({
        type: IdType,
        required: false,
        defaultValue: 'slug'
      }),
      where: t.arg({
        type: PlausibleStatsTimeseriesFilter,
        required: true
      })
    },
    resolve: async (
      _parent,
      { id, idType, where },
      context,
      info: GraphQLResolveInfo
    ) => {
      if (context.type !== 'authenticated') {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        })
      }

      const journey = await loadJourneyOrThrow(id, normalizeIdType(idType))

      if (!ability(Action.Update, subject('Journey', journey), context.user)) {
        throw new GraphQLError('User is not allowed to view journey', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      const metrics = getMetrics(info)
      return getJourneyStatsTimeseries(journey.id, {
        metrics,
        ...where
      })
    }
  })
)
