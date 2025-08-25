import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { JourneyNotificationUpdateInput } from './inputs'

export const JourneyNotificationRef = builder.prismaObject(
  'JourneyNotification',
  {
    shareable: true,
    fields: (t) => ({
      id: t.exposeID('id', { nullable: false }),
      userId: t.exposeID('userId', { nullable: false }),
      journeyId: t.exposeID('journeyId', { nullable: false }),
      userTeamId: t.exposeID('userTeamId', { nullable: true }),
      userJourneyId: t.exposeID('userJourneyId', { nullable: true }),
      visitorInteractionEmail: t.exposeBoolean('visitorInteractionEmail', {
        nullable: false
      })
    })
  }
)

// Helper function to check if user can manage journey notification
function canManageJourneyNotification(
  journeyNotification: any,
  user: any
): boolean {
  return journeyNotification.userId === user.id
}

// Mutation for updating journey notifications
builder.mutationField('journeyNotificationUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: JourneyNotificationRef,
    args: {
      input: t.arg({ type: JourneyNotificationUpdateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const { journeyId, visitorInteractionEmail } = input
      const user = context.user

      // Get the journey with related user data for authorization
      const journey = await prisma.journey.findUnique({
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

      // Find the user's team and journey relationships
      const userJourney = journey.userJourneys.find(
        (uj) => uj.userId === user.id
      )
      const userTeam = journey.team?.userTeams.find(
        (ut) => ut.userId === user.id
      )

      // Check if user has access to this journey
      if (!userJourney && !userTeam) {
        throw new GraphQLError(
          'user is not allowed to manage journey notifications',
          {
            extensions: { code: 'FORBIDDEN' }
          }
        )
      }

      // Prepare upsert data
      const upsertInput = {
        userId: user.id,
        journeyId,
        visitorInteractionEmail,
        userJourneyId: userJourney?.id || null,
        userTeamId: userTeam?.id || null
      }

      // Upsert the journey notification
      const journeyNotification = await prisma.journeyNotification.upsert({
        where: {
          userId_journeyId: {
            userId: user.id,
            journeyId
          }
        },
        create: upsertInput,
        update: {
          visitorInteractionEmail,
          userJourneyId: userJourney?.id || null,
          userTeamId: userTeam?.id || null
        },
        include: {
          journey: true,
          userTeam: true,
          userJourney: true
        }
      })

      // Final authorization check
      if (!canManageJourneyNotification(journeyNotification, user)) {
        throw new GraphQLError(
          'user is not allowed to manage journey notification',
          {
            extensions: { code: 'FORBIDDEN' }
          }
        )
      }

      return journeyNotification
    }
  })
)
