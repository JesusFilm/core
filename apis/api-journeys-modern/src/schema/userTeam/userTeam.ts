import { GraphQLError } from 'graphql'

import {
  UserTeamRole as PrismaUserTeamRole,
  prisma
} from '@core/prisma/journeys/client'

import { builder } from '../builder'
import { JourneyNotificationRef } from '../journeyNotification'
import { UserRef } from '../user'

import { UserTeamRole } from './enums'
import { UserTeamFilterInput, UserTeamUpdateInput } from './inputs'

export const UserTeamRef = builder.prismaObject('UserTeam', {
  shareable: true,
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    role: t.field({
      nullable: false,
      type: UserTeamRole,
      resolve: (userTeam) => userTeam.role
    }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
    user: t.field({
      nullable: false,
      type: UserRef,
      resolve: (userTeam) => ({
        id: userTeam.userId
      })
    }),
    journeyNotification: t.field({
      type: JourneyNotificationRef,
      nullable: true,
      args: {
        journeyId: t.arg.id({ required: true })
      },

      select: (args) => ({
        journeyNotifications: {
          where: {
            journeyId: args.journeyId
          }
        }
      }),
      resolve: async ({ journeyNotifications }) => {
        return journeyNotifications[0] || null
      }
    })
  })
})

// Helper function to fetch UserTeam with ACL includes
async function fetchUserTeamWithAclIncludes(id: string) {
  return await prisma.userTeam.findUnique({
    where: { id },
    include: {
      team: { include: { userTeams: true } }
    }
  })
}

// Helper function to check UserTeam access
function canAccessUserTeam(action: string, userTeam: any, user: any): boolean {
  if (!userTeam || !userTeam.team) return false

  const currentUserTeam = userTeam.team.userTeams.find(
    (ut: any) => ut.userId === user.id
  )

  switch (action) {
    case 'read':
      // Can read if user is a member or manager of the team
      return currentUserTeam != null
    case 'update':
    case 'delete':
      // Can update/delete if user is a manager of the team
      return currentUserTeam?.role === PrismaUserTeamRole.manager
    default:
      return false
  }
}

// Queries
builder.queryField('userTeams', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: [UserTeamRef],
    args: {
      teamId: t.arg.id({ required: true }),
      where: t.arg({ type: UserTeamFilterInput, required: false })
    },
    resolve: async (_, { teamId, where }, context) => {
      const user = context.user

      // Check if user has access to this team
      const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: { userTeams: true }
      })

      if (!team) {
        throw new GraphQLError('Team not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      const currentUserTeam = team.userTeams.find((ut) => ut.userId === user.id)
      if (!currentUserTeam) {
        throw new GraphQLError('User is not allowed to view team members', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      // Build role filter
      const roleFilter = where?.role ? { role: { in: where.role } } : {}

      return await prisma.userTeam.findMany({
        where: {
          teamId,
          ...roleFilter
        },
        include: {
          team: { include: { userTeams: true } }
        }
      })
    }
  })
)

builder.queryField('userTeam', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: UserTeamRef,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (_, { id }, context) => {
      const user = context.user

      const userTeam = await fetchUserTeamWithAclIncludes(id)
      if (!userTeam) {
        throw new GraphQLError('UserTeam not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      if (canAccessUserTeam('read', userTeam, user)) {
        return userTeam
      }

      throw new GraphQLError('User is not allowed to view userTeam', {
        extensions: { code: 'FORBIDDEN' }
      })
    }
  })
)

// Mutations
builder.mutationField('userTeamUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: UserTeamRef,
    args: {
      id: t.arg.id({ required: true }),
      input: t.arg({ type: UserTeamUpdateInput, required: true })
    },
    resolve: async (_, { id, input }, context) => {
      const user = context.user

      const userTeam = await fetchUserTeamWithAclIncludes(id)
      if (!userTeam) {
        throw new GraphQLError('UserTeam not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      if (!canAccessUserTeam('update', userTeam, user)) {
        throw new GraphQLError('User is not allowed to update userTeam', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.userTeam.update({
        where: { id },
        data: input,
        include: {
          team: { include: { userTeams: true } }
        }
      })
    }
  })
)

builder.mutationField('userTeamDelete', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: UserTeamRef,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (_, { id }, context) => {
      const user = context.user

      const userTeam = await fetchUserTeamWithAclIncludes(id)
      if (!userTeam) {
        throw new GraphQLError('UserTeam not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      if (!canAccessUserTeam('delete', userTeam, user)) {
        throw new GraphQLError('User is not allowed to delete userTeam', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      // Delete the userTeam
      const deletedUserTeam = await prisma.userTeam.delete({
        where: { id },
        include: {
          team: { include: { userTeams: true } }
        }
      })

      // TODO: Send team removal email
      // await UserTeamService.sendTeamRemovedEmail(userTeam.team.title, userTeam.userId)

      return deletedUserTeam
    }
  })
)
