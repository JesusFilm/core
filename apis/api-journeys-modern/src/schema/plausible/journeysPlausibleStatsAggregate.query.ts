import { GraphQLError, GraphQLResolveInfo } from 'graphql'

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
import { getJourneyStatsAggregate } from './service'

builder.queryField('journeysPlausibleStatsAggregate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: PlausibleStatsAggregateResponseRef,
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
      return getJourneyStatsAggregate(journey.id, {
        metrics,
        ...where
      })
    }
  })
)
