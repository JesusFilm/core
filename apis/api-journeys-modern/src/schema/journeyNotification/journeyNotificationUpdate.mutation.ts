import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { JourneyNotificationUpdateInput } from './inputs'
import { JourneyNotificationRef } from './journeyNotification'

builder.mutationField('journeyNotificationUpdate', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: JourneyNotificationRef,
      nullable: false,
      override: { from: 'api-journeys' },
      args: {
        input: t.arg({ type: JourneyNotificationUpdateInput, required: true })
      },
      resolve: async (query, _parent, args, context) => {
        const userId = context.user.id
        const { journeyId, ...updateData } = args.input

        const journey = await prisma.journey.findUnique({
          where: { id: String(journeyId) },
          include: {
            team: { include: { userTeams: true } },
            userJourneys: true
          }
        })

        if (journey == null)
          throw new GraphQLError('journey not found', {
            extensions: { code: 'NOT_FOUND' }
          })

        const userJourneyId = journey.userJourneys?.find(
          (uj) => uj.userId === userId
        )?.id

        const userTeamId = journey.team?.userTeams?.find(
          (ut) => ut.userId === userId
        )?.id

        if (userJourneyId == null && userTeamId == null)
          throw new GraphQLError(
            'user is not allowed to update journey notification',
            { extensions: { code: 'FORBIDDEN' } }
          )

        return prisma.journeyNotification.upsert({
          ...query,
          where: { userId_journeyId: { userId, journeyId: String(journeyId) } },
          update: {
            ...updateData,
            userJourneyId,
            userTeamId
          },
          create: {
            userId,
            journeyId: String(journeyId),
            ...updateData,
            userJourneyId,
            userTeamId
          }
        })
      }
    })
)
