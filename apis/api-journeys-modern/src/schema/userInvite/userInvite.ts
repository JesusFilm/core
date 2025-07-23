import { GraphQLError } from 'graphql'
import omit from 'lodash/omit'

import { UserInvite, UserJourneyRole } from '.prisma/api-journeys-modern-client'

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

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

// Register as a federated entity
builder.asEntity(UserInviteRef, {
  key: builder.selection<{ id: string }>('id'),
  resolveReference: async ({ id }) =>
    await prisma.userInvite.findUnique({ where: { id } })
})

// UserInvite queries
builder.queryField('userInvites', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [UserInviteRef],
    args: {
      journeyId: t.arg.id({ required: true })
    },
    resolve: async (_parent, args, context) => {
      const { journeyId } = args
      const user = context.user

      // Check if user has access to this journey
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

      // Check if user is a team member or has journey access
      const isTeamMember = journey.team?.userTeams.some(
        (ut) => ut.userId === user.id
      )
      const hasJourneyAccess = journey.userJourneys.some(
        (uj) =>
          uj.userId === user.id &&
          (uj.role === UserJourneyRole.owner ||
            uj.role === UserJourneyRole.editor)
      )

      if (!isTeamMember && !hasJourneyAccess) {
        throw new GraphQLError('user is not allowed to view user invites', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.userInvite.findMany({
        where: {
          journeyId,
          removedAt: null,
          acceptedAt: null
        }
      })
    }
  })
)

// UserInvite mutations
builder.mutationField('userInviteCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: UserInviteRef,
    nullable: true,
    args: {
      journeyId: t.arg.id({ required: true }),
      input: t.arg({ type: UserInviteCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { journeyId, input } = args
      const user = context.user

      return await prisma.$transaction(async (tx) => {
        // Check permissions first
        const journey = await tx.journey.findUnique({
          where: { id: journeyId },
          include: {
            team: { include: { userTeams: true } },
            userJourneys: true,
            primaryImageBlock: true
          }
        })

        if (!journey) {
          throw new GraphQLError('journey not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        }

        // Check if user can create invites
        const isTeamMember = journey.team?.userTeams.some(
          (ut) => ut.userId === user.id
        )
        const hasJourneyAccess = journey.userJourneys.some(
          (uj) =>
            uj.userId === user.id &&
            (uj.role === UserJourneyRole.owner ||
              uj.role === UserJourneyRole.editor)
        )

        if (!isTeamMember && !hasJourneyAccess) {
          throw new GraphQLError('user is not allowed to create user invite', {
            extensions: { code: 'FORBIDDEN' }
          })
        }

        // Create or update the invite
        const userInvite = await tx.userInvite.upsert({
          where: { journeyId_email: { journeyId, email: input.email } },
          create: {
            journey: { connect: { id: journeyId } },
            senderId: user.id,
            email: input.email
          },
          update: {
            senderId: user.id,
            acceptedAt: null,
            removedAt: null
          }
        })

        // TODO: Send email invitation
        // await this.userInviteService.sendEmail(journey, input.email, omit(user, ['id']))

        return userInvite
      })
    }
  })
)

builder.mutationField('userInviteRemove', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: UserInviteRef,
    args: {
      id: t.arg.id({ required: true }),
      journeyId: t.arg.id({ required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id, journeyId } = args
      const user = context.user

      // Check permissions
      const userInvite = await prisma.userInvite.findUnique({
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

      if (!userInvite || userInvite.journeyId !== journeyId) {
        throw new GraphQLError('user invite not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check if user can remove invites
      const isTeamMember = userInvite.journey.team?.userTeams.some(
        (ut) => ut.userId === user.id
      )
      const hasJourneyAccess = userInvite.journey.userJourneys.some(
        (uj) =>
          uj.userId === user.id &&
          (uj.role === UserJourneyRole.owner ||
            uj.role === UserJourneyRole.editor)
      )

      if (!isTeamMember && !hasJourneyAccess) {
        throw new GraphQLError('user is not allowed to remove user invite', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      // Mark as removed
      return await prisma.userInvite.update({
        where: { id },
        data: { removedAt: new Date() }
      })
    }
  })
)

builder.mutationField('userInviteAcceptAll', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [UserInviteRef],
    resolve: async (_parent, _args, context) => {
      const user = context.user

      if (!user.email) {
        throw new GraphQLError('user email is required to accept invites', {
          extensions: { code: 'BAD_REQUEST' }
        })
      }

      // Find all pending invites for this user's email
      const pendingInvites = await prisma.userInvite.findMany({
        where: {
          email: user.email,
          acceptedAt: null,
          removedAt: null
        }
      })

      if (pendingInvites.length === 0) {
        return []
      }

      // Accept all invites and create user journeys
      return await prisma.$transaction(async (tx) => {
        const acceptedInvites: UserInvite[] = []

        for (const invite of pendingInvites) {
          // Create or update user journey
          await tx.userJourney.upsert({
            where: {
              journeyId_userId: {
                journeyId: invite.journeyId,
                userId: user.id
              }
            },
            create: {
              userId: user.id,
              journeyId: invite.journeyId,
              role: UserJourneyRole.editor
            },
            update: {} // Don't change existing access
          })

          // Mark invite as accepted
          const acceptedInvite = await tx.userInvite.update({
            where: { id: invite.id },
            data: { acceptedAt: new Date() }
          })

          acceptedInvites.push(acceptedInvite)
        }

        return acceptedInvites
      })
    }
  })
)

export { UserInviteRef }
