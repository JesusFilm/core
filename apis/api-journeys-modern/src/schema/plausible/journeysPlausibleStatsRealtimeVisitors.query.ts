import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { Action, ability, subject } from '../../lib/auth/ability'
import { builder } from '../builder'
import { IdType } from '../journey/enums'

import { getJourneyRealtimeVisitors } from './service'

builder.queryField('journeysPlausibleStatsRealtimeVisitors', (t) =>
  t
    .withAuth({ isAuthenticated: true })
    .int({
      args: {
        id: t.arg.id({ required: true }),
        idType: t.arg({
          type: IdType,
          required: false,
          defaultValue: 'slug'
        })
      },
      resolve: async (_parent, { id, idType = 'slug' }, context) => {
        const where =
          idType === 'slug'
            ? { slug: id }
            : {
                id
              }

        const journey = await prisma.journey.findUnique({
          where,
          include: {
            userJourneys: true,
            team: {
              include: { userTeams: true }
            }
          }
        })

        if (journey == null) {
          throw new GraphQLError('Journey not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        }

        const canViewJourney = ability(
          Action.Update,
          subject('Journey', journey),
          context.user
        )

        if (!canViewJourney) {
          throw new GraphQLError('User is not allowed to view journey', {
            extensions: { code: 'FORBIDDEN' }
          })
        }

        return getJourneyRealtimeVisitors(journey.id)
      }
    })
)

