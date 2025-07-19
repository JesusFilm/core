import { GraphQLError } from 'graphql'

import { UserInvite, UserJourneyRole } from '.prisma/api-journeys-modern-client'

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

import { UserInviteService } from './userInvite.service'

// Define input types
const UserInviteCreateInput = builder.inputType('UserInviteCreateInput', {
  fields: (t) => ({
    email: t.string({ required: true })
  })
})

// Define UserInvite object type
const UserInviteRef = builder.prismaObject('UserInvite', {
  fields: (t) => ({
    id: t.exposeID('id'),
    journeyId: t.exposeID('journeyId'),
    senderId: t.exposeID('senderId'),
    email: t.exposeString('email'),
    acceptedAt: t.expose('acceptedAt', { type: 'DateTime', nullable: true }),
    removedAt: t.expose('removedAt', { type: 'DateTime', nullable: true }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    journey: t.relation('journey')
  })
})

// Query to list journey invites
builder.queryField('userInvites', (t) =>
  t.prismaField({
    type: [UserInviteRef],
    args: {
      journeyId: t.arg.id({ required: true })
    },
    authScopes: { isAuthenticated: true },
    resolve: async (query, _root, { journeyId }, context) => {
      const { user } = context as { user: { id: string; email?: string } }
      if (!user?.id) {
        throw new GraphQLError('User not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        })
      }

      // Basic authorization - user must be team member or journey editor
      const journey = await prisma.journey.findUnique({
        where: { id: journeyId },
        include: {
          team: {
            include: { userTeams: true }
          },
          userJourneys: true
        }
      })

      if (!journey) {
        throw new GraphQLError('Journey not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check if user is team member or journey editor
      const isTeamMember = journey.team?.userTeams.some(
        (ut) => ut.userId === user.id
      )
      const isJourneyEditor = journey.userJourneys.some(
        (uj) =>
          uj.userId === user.id &&
          (uj.role === UserJourneyRole.editor ||
            uj.role === UserJourneyRole.owner)
      )

      if (!isTeamMember && !isJourneyEditor) {
        throw new GraphQLError('User not authorized to view journey invites', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.userInvite.findMany({
        ...query,
        where: {
          journeyId,
          removedAt: null,
          acceptedAt: null
        }
      })
    }
  })
)

// Mutation to create journey invite
builder.mutationField('userInviteCreate', (t) =>
  t.prismaField({
    type: UserInviteRef,
    nullable: true,
    args: {
      journeyId: t.arg.id({ required: true }),
      input: t.arg({ type: UserInviteCreateInput, required: true })
    },
    authScopes: { isAuthenticated: true },
    resolve: async (query, _root, { journeyId, input }, context) => {
      const { user } = context as { user: { id: string; email?: string } }
      if (!user?.id) {
        throw new GraphQLError('User not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        })
      }

      return await prisma.$transaction(async (tx) => {
        // Check if user can create invites for this journey
        const journey = await tx.journey.findUnique({
          where: { id: journeyId },
          include: {
            team: {
              include: { userTeams: true }
            },
            userJourneys: true,
            primaryImageBlock: true
          }
        })

        if (!journey) {
          throw new GraphQLError('Journey not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        }

        // Check if user is team member or journey editor
        const isTeamMember = journey.team?.userTeams.some(
          (ut) => ut.userId === user.id
        )
        const isJourneyEditor = journey.userJourneys.some(
          (uj) =>
            uj.userId === user.id &&
            (uj.role === UserJourneyRole.editor ||
              uj.role === UserJourneyRole.owner)
        )

        if (!isTeamMember && !isJourneyEditor) {
          throw new GraphQLError(
            'User not authorized to create journey invites',
            {
              extensions: { code: 'FORBIDDEN' }
            }
          )
        }

        const userInvite = await tx.userInvite.upsert({
          ...query,
          where: {
            journeyId_email: {
              journeyId,
              email: input.email
            }
          },
          create: {
            email: input.email,
            senderId: user.id,
            journey: { connect: { id: journeyId } }
          },
          update: {
            senderId: user.id,
            acceptedAt: null,
            removedAt: null
          },
          include: {
            journey: {
              include: {
                team: {
                  include: { userTeams: true }
                },
                userJourneys: true,
                primaryImageBlock: true
              }
            }
          }
        })

        // Send invite email (placeholder)
        await UserInviteService.sendEmail(userInvite.journey, input.email, user)

        return userInvite
      })
    }
  })
)

// Mutation to remove journey invite
builder.mutationField('userInviteRemove', (t) =>
  t.prismaField({
    type: UserInviteRef,
    args: {
      id: t.arg.id({ required: true }),
      journeyId: t.arg.id({ required: true })
    },
    authScopes: { isAuthenticated: true },
    resolve: async (query, _root, { id, journeyId }, context) => {
      const { user } = context as { user: { id: string; email?: string } }
      if (!user?.id) {
        throw new GraphQLError('User not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        })
      }

      const userInvite = await prisma.userInvite.findUnique({
        where: { id },
        include: {
          journey: {
            include: {
              team: {
                include: { userTeams: true }
              },
              userJourneys: true
            }
          }
        }
      })

      if (!userInvite) {
        throw new GraphQLError('UserInvite not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      if (userInvite.journeyId !== journeyId) {
        throw new GraphQLError('Invalid journey ID for this invite', {
          extensions: { code: 'BAD_REQUEST' }
        })
      }

      // Check if user can remove invites for this journey
      const isTeamMember = userInvite.journey.team?.userTeams.some(
        (ut) => ut.userId === user.id
      )
      const isJourneyEditor = userInvite.journey.userJourneys.some(
        (uj) =>
          uj.userId === user.id &&
          (uj.role === UserJourneyRole.editor ||
            uj.role === UserJourneyRole.owner)
      )

      if (!isTeamMember && !isJourneyEditor) {
        throw new GraphQLError(
          'User not authorized to remove journey invites',
          {
            extensions: { code: 'FORBIDDEN' }
          }
        )
      }

      return await prisma.userInvite.update({
        ...query,
        where: { id },
        data: {
          acceptedAt: null, // Reset acceptedAt as per legacy behavior
          removedAt: new Date()
        }
      })
    }
  })
)

// Mutation to accept all pending journey invites for current user
builder.mutationField('userInviteAcceptAll', (t) =>
  t.prismaField({
    type: [UserInviteRef],
    authScopes: { isAuthenticated: true },
    resolve: async (query, _root, _args, context) => {
      const { user } = context as { user: { id: string; email?: string } }
      if (!user?.id || !user?.email) {
        throw new GraphQLError('User must have email to accept invites', {
          extensions: { code: 'BAD_REQUEST' }
        })
      }

      const userInvites = await prisma.userInvite.findMany({
        where: {
          email: user.email,
          acceptedAt: null,
          removedAt: null
        }
      })

      const redeemedUserInvites = await Promise.all(
        userInvites.map(async (userInvite) => {
          const [, redeemedInvite] = await prisma.$transaction([
            prisma.userJourney.upsert({
              where: {
                journeyId_userId: {
                  journeyId: userInvite.journeyId,
                  userId: user.id
                }
              },
              create: {
                journey: { connect: { id: userInvite.journeyId } },
                userId: user.id,
                role: UserJourneyRole.editor
              },
              update: {
                role: UserJourneyRole.editor
              }
            }),
            prisma.userInvite.update({
              ...query,
              where: { id: userInvite.id },
              data: {
                acceptedAt: new Date()
              }
            })
          ])

          return redeemedInvite
        })
      )

      return redeemedUserInvites
    }
  })
)

export { UserInviteRef }
