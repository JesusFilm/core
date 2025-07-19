import { GraphQLError } from 'graphql'

import { JourneyNotification } from '.prisma/api-journeys-modern-client'

import { Action } from '../../lib/auth/ability'
import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

import { canAccessJourneyNotification } from './journeyNotification.acl'

// Input types
const JourneyNotificationUpdateInput = builder.inputType(
  'JourneyNotificationUpdateInput',
  {
    fields: (t) => ({
      journeyId: t.id({ required: true }),
      visitorInteractionEmail: t.boolean({ required: true })
    })
  }
)

// JourneyNotification object type
const JourneyNotificationRef = builder.prismaObject('JourneyNotification', {
  fields: (t) => ({
    id: t.exposeID('id'),
    userId: t.exposeID('userId'),
    journeyId: t.exposeID('journeyId'),
    userTeamId: t.exposeID('userTeamId', { nullable: true }),
    userJourneyId: t.exposeID('userJourneyId', { nullable: true }),
    visitorInteractionEmail: t.exposeBoolean('visitorInteractionEmail'),
    journey: t.relation('journey'),
    userTeam: t.relation('userTeam'),
    userJourney: t.relation('userJourney')
  })
})

// Mutation: journeyNotificationUpdate - Update or create journey notification preferences
builder.mutationField('journeyNotificationUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: JourneyNotificationRef,
    nullable: false,
    args: {
      input: t.arg({ type: JourneyNotificationUpdateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const { journeyId } = input
      const userId = context.user.id

      return await prisma.$transaction(async (tx) => {
        // Fetch journey with team and userJourney data to get relationship IDs
        const journey = await tx.journey.findUnique({
          where: { id: journeyId },
          include: {
            team: { include: { userTeams: true } },
            userJourneys: true
          }
        })

        if (!journey) {
          throw new GraphQLError('journey not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        }

        // Find user's relationship to this journey
        const userJourneyId = journey.userJourneys?.find(
          (userJourney) => userJourney.userId === userId
        )?.id

        const userTeamId = journey.team?.userTeams?.find(
          (userTeam) => userTeam.userId === userId
        )?.id

        // Create upsert input with relationship IDs
        const upsertInput = {
          ...input,
          userJourneyId,
          userTeamId
        }

        // Upsert the journey notification
        const journeyNotification = await tx.journeyNotification.upsert({
          where: { userId_journeyId: { userId, journeyId } },
          update: upsertInput,
          create: { userId, ...upsertInput },
          include: {
            userJourney: true,
            userTeam: true
          }
        })

        // Check permissions after creation/update
        if (
          !canAccessJourneyNotification(
            Action.Manage,
            journeyNotification,
            context.user
          )
        ) {
          throw new GraphQLError(
            'user is not allowed to update journey notification',
            {
              extensions: { code: 'FORBIDDEN' }
            }
          )
        }

        return journeyNotification
      })
    }
  })
)
