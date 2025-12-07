import { GraphQLError } from 'graphql'

import { Action, ability, subject } from '../../lib/auth/ability'
import { builder } from '../builder'
import { IdType } from '../journey/enums'

import { loadJourneyOrThrow, normalizeIdType } from './journeyAccess'
import { getJourneyRealtimeVisitors } from './service'

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

      return getJourneyRealtimeVisitors(journey.id)
    }
  })
)
