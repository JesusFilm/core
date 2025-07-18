import { GraphQLError } from 'graphql'

import {
  UserTeamInvite,
  UserTeamRole
} from '.prisma/api-journeys-modern-client'

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

import { UserTeamInviteService } from './userTeamInvite.service'

// Define input types
const UserTeamInviteCreateInput = builder.inputType(
  'UserTeamInviteCreateInput',
  {
    fields: (t) => ({
      email: t.string({ required: true })
    })
  }
)

// Define UserTeamInvite object type
const UserTeamInviteRef = builder.prismaObject('UserTeamInvite', {
  fields: (t) => ({
    id: t.exposeID('id'),
    teamId: t.exposeID('teamId'),
    email: t.exposeString('email'),
    senderId: t.exposeID('senderId'),
    receipientId: t.exposeID('receipientId', { nullable: true }),
    acceptedAt: t.expose('acceptedAt', { type: 'DateTime', nullable: true }),
    removedAt: t.expose('removedAt', { type: 'DateTime', nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    team: t.relation('team')
  })
})

// Placeholder ACL function
function canAccessUserTeamInvite(
  action: string,
  userTeamInvite: UserTeamInvite,
  userId: string
): boolean {
  // TODO: Implement proper ACL checking
  // For now, allow access if user is part of the team
  return true
}

// Query to list team invites
builder.queryField('userTeamInvites', (t) =>
  t.prismaField({
    type: [UserTeamInviteRef],
    args: {
      teamId: t.arg.id({ required: true })
    },
    authScopes: { isAuthenticated: true },
    resolve: async (query, _root, { teamId }, context) => {
      const { user } = context as { user: { id: string; email?: string } }
      if (!user?.id) {
        throw new GraphQLError('User not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        })
      }

      // Basic authorization - user must be team member
      const userTeam = await prisma.userTeam.findUnique({
        where: {
          teamId_userId: {
            teamId,
            userId: user.id
          }
        }
      })

      if (!userTeam) {
        throw new GraphQLError('User not authorized to view team invites', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.userTeamInvite.findMany({
        ...query,
        where: {
          teamId,
          removedAt: null,
          acceptedAt: null
        }
      })
    }
  })
)

// Mutation to create team invite
builder.mutationField('userTeamInviteCreate', (t) =>
  t.prismaField({
    type: UserTeamInviteRef,
    nullable: true,
    args: {
      teamId: t.arg.id({ required: true }),
      input: t.arg({ type: UserTeamInviteCreateInput, required: true })
    },
    authScopes: { isAuthenticated: true },
    resolve: async (query, _root, { teamId, input }, context) => {
      const { user } = context as { user: { id: string; email?: string } }
      if (!user?.id) {
        throw new GraphQLError('User not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        })
      }

      return await prisma.$transaction(async (tx) => {
        // Check if user is manager of the team
        const userTeam = await tx.userTeam.findUnique({
          where: {
            teamId_userId: {
              teamId,
              userId: user.id
            }
          }
        })

        if (!userTeam || userTeam.role !== UserTeamRole.manager) {
          throw new GraphQLError('User not authorized to create team invites', {
            extensions: { code: 'FORBIDDEN' }
          })
        }

        const userTeamInvite = await tx.userTeamInvite.upsert({
          ...query,
          where: {
            teamId_email: {
              teamId,
              email: input.email
            }
          },
          create: {
            email: input.email,
            senderId: user.id,
            team: { connect: { id: teamId } }
          },
          update: {
            senderId: user.id,
            acceptedAt: null,
            receipientId: null,
            removedAt: null
          },
          include: {
            team: {
              include: { userTeams: true }
            }
          }
        })

        // Send invite email (placeholder)
        await UserTeamInviteService.sendTeamInviteEmail(
          userTeamInvite.team,
          input.email,
          user
        )

        return userTeamInvite
      })
    }
  })
)

// Mutation to remove team invite
builder.mutationField('userTeamInviteRemove', (t) =>
  t.prismaField({
    type: UserTeamInviteRef,
    args: {
      id: t.arg.id({ required: true })
    },
    authScopes: { isAuthenticated: true },
    resolve: async (query, _root, { id }, context) => {
      const { user } = context as { user: { id: string; email?: string } }
      if (!user?.id) {
        throw new GraphQLError('User not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        })
      }

      const userTeamInvite = await prisma.userTeamInvite.findUnique({
        where: { id },
        include: { team: { include: { userTeams: true } } }
      })

      if (!userTeamInvite) {
        throw new GraphQLError('UserTeamInvite not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check if user is manager of the team
      const userTeam = userTeamInvite.team.userTeams.find(
        (ut) => ut.userId === user.id && ut.role === UserTeamRole.manager
      )

      if (!userTeam) {
        throw new GraphQLError('User not authorized to remove team invites', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.userTeamInvite.update({
        ...query,
        where: { id },
        data: {
          removedAt: new Date()
        }
      })
    }
  })
)

// Mutation to accept all pending team invites for current user
builder.mutationField('userTeamInviteAcceptAll', (t) =>
  t.prismaField({
    type: [UserTeamInviteRef],
    authScopes: { isAuthenticated: true },
    resolve: async (query, _root, _args, context) => {
      const { user } = context as { user: { id: string; email?: string } }
      if (!user?.id || !user?.email) {
        throw new GraphQLError('User must have email to accept invites', {
          extensions: { code: 'BAD_REQUEST' }
        })
      }

      const userTeamInvites = await prisma.userTeamInvite.findMany({
        where: {
          email: user.email,
          acceptedAt: null,
          removedAt: null
        }
      })

      const redeemedUserTeamInvites = await Promise.all(
        userTeamInvites.map(async (userTeamInvite) => {
          const [, redeemedInvite] = await prisma.$transaction([
            prisma.userTeam.upsert({
              where: {
                teamId_userId: {
                  teamId: userTeamInvite.teamId,
                  userId: user.id
                }
              },
              create: {
                team: { connect: { id: userTeamInvite.teamId } },
                userId: user.id,
                role: UserTeamRole.member
              },
              update: {
                role: UserTeamRole.member
              }
            }),
            prisma.userTeamInvite.update({
              ...query,
              where: { id: userTeamInvite.id },
              data: {
                acceptedAt: new Date(),
                receipientId: user.id
              },
              include: {
                team: {
                  include: { userTeams: true }
                }
              }
            })
          ])

          // Send acceptance email (placeholder)
          await UserTeamInviteService.sendTeamInviteAcceptedEmail(
            redeemedInvite.team,
            user
          )

          return redeemedInvite
        })
      )

      return redeemedUserTeamInvites
    }
  })
)

export { UserTeamInviteRef }
