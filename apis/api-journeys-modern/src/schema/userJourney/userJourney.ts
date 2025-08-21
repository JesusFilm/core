import { GraphQLError } from 'graphql'
import omit from 'lodash/omit'

import {
  UserJourneyRole as PrismaUserJourneyRole,
  prisma
} from '@core/prisma/journeys/client'

import { builder } from '../builder'
import { UserRef } from '../user/user'

import { UserJourneyRole } from './enums/userJourneyRole'
import { UserJourneyService } from './userJourney.service'

export const UserJourneyRef = builder.prismaObject('UserJourney', {
  shareable: true,
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    userId: t.exposeID('userId', { nullable: false }),
    journeyId: t.exposeID('journeyId', { nullable: false }),
    role: t.field({
      nullable: false,
      type: UserJourneyRole,
      resolve: (userJourney) => userJourney.role
    }),
    openedAt: t.expose('openedAt', { type: 'DateTime', nullable: true }),
    journey: t.relation('journey'),
    user: t.field({
      type: UserRef,
      resolve: (userJourney) => ({
        id: userJourney.userId
      })
    }),
    journeyNotification: t.relation('journeyNotification', { nullable: true })
  })
})

// Helper function to fetch UserJourney with ACL includes
async function fetchUserJourneyWithAclIncludes(id: string) {
  return await prisma.userJourney.findUnique({
    where: { id },
    include: {
      journey: {
        include: {
          team: { include: { userTeams: true } },
          userJourneys: true
        }
      }
    }
  })
}

// Temporary ACL check - TODO: Implement proper UserJourney ACL
function canAccessUserJourney(
  action: string,
  userJourney: any,
  user: any
): boolean {
  // Basic permission check - user can manage their own userJourney
  return userJourney.userId === user.id
}

// UserJourney mutations
builder.mutationField('userJourneyRequest', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: UserJourneyRef,
    args: {
      journeyId: t.arg.id({ required: true })
    },
    resolve: async (_parent, args, context) => {
      const { journeyId } = args
      const user = context.user

      return await prisma.$transaction(async (tx) => {
        const userJourney = await tx.userJourney.upsert({
          where: { journeyId_userId: { journeyId, userId: user.id } },
          create: {
            userId: user.id,
            journey: { connect: { id: journeyId } },
            role: PrismaUserJourneyRole.inviteRequested
          },
          update: {},
          include: {
            journey: {
              include: { userJourneys: true, team: true }
            }
          }
        })

        if (!canAccessUserJourney('create', userJourney, user)) {
          throw new GraphQLError('user is not allowed to create userJourney', {
            extensions: { code: 'FORBIDDEN' }
          })
        }

        await UserJourneyService.sendJourneyAccessRequest(
          userJourney.journey,
          omit(user, ['id', 'emailVerified'])
        )
        return userJourney
      })
    }
  })
)

builder.mutationField('userJourneyApprove', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: UserJourneyRef,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id } = args
      const user = context.user

      const userJourney = await fetchUserJourneyWithAclIncludes(id)
      if (userJourney == null) {
        throw new GraphQLError('userJourney not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      if (!canAccessUserJourney('update', userJourney, user)) {
        throw new GraphQLError('user is not allowed to update userJourney', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      const retVal = await prisma.userJourney.update({
        where: { id },
        data: { role: PrismaUserJourneyRole.editor }
      })

      await UserJourneyService.sendJourneyApproveEmail(
        userJourney.journey,
        userJourney.userId,
        omit(user, ['id', 'emailVerified'])
      )

      return retVal
    }
  })
)

builder.mutationField('userJourneyPromote', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: UserJourneyRef,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id } = args
      const user = context.user

      const userJourney = await fetchUserJourneyWithAclIncludes(id)
      if (userJourney == null) {
        throw new GraphQLError('userJourney not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      if (!canAccessUserJourney('update', userJourney, user)) {
        throw new GraphQLError('user is not allowed to update userJourney', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.$transaction(async (tx) => {
        await tx.userJourney.updateMany({
          where: {
            journeyId: userJourney.journey.id,
            role: PrismaUserJourneyRole.owner
          },
          data: { role: PrismaUserJourneyRole.editor }
        })
        return await tx.userJourney.update({
          where: { id },
          data: { role: PrismaUserJourneyRole.owner }
        })
      })
    }
  })
)

builder.mutationField('userJourneyRemove', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: UserJourneyRef,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id } = args
      const user = context.user

      const userJourney = await fetchUserJourneyWithAclIncludes(id)
      if (userJourney == null) {
        throw new GraphQLError('userJourney not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      if (!canAccessUserJourney('delete', userJourney, user)) {
        throw new GraphQLError('user is not allowed to delete userJourney', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.userJourney.delete({ where: { id } })
    }
  })
)

builder.mutationField('userJourneyRemoveAll', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [UserJourneyRef],
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id: journeyId } = args
      const user = context.user

      // Get all user journeys for this journey that user can delete
      const userJourneys = await prisma.userJourney.findMany({
        where: { journeyId },
        include: {
          journey: {
            include: {
              team: { include: { userTeams: true } },
              userJourneys: true
            }
          }
        }
      })

      // Filter to only those the user can delete
      const deletableUserJourneys = userJourneys.filter((userJourney) =>
        canAccessUserJourney('delete', userJourney, user)
      )

      if (deletableUserJourneys.length === 0) {
        return []
      }

      await prisma.userJourney.deleteMany({
        where: {
          id: { in: deletableUserJourneys.map(({ id }) => id) }
        }
      })

      return deletableUserJourneys
    }
  })
)

builder.mutationField('userJourneyOpen', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: UserJourneyRef,
    nullable: true,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id: journeyId } = args
      const user = context.user

      const userJourney = await prisma.userJourney.findUnique({
        where: { journeyId_userId: { journeyId, userId: user.id } }
      })

      if (userJourney == null) return null

      if (!canAccessUserJourney('update', userJourney, user)) {
        throw new GraphQLError('user is not allowed to update userJourney', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.userJourney.update({
        where: { id: userJourney.id },
        data: { openedAt: new Date() }
      })
    }
  })
)
