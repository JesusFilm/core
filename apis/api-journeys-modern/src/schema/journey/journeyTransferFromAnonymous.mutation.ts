import { GraphQLError } from 'graphql'

import {
  UserJourneyRole,
  UserTeamRole,
  prisma
} from '@core/prisma/journeys/client'
import { prisma as prismaUsers } from '@core/prisma/users/client'

import { builder } from '../builder'

import { JourneyRef } from './journey'

builder.mutationField('journeyTransferFromAnonymous', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: JourneyRef,
    nullable: false,
    args: {
      journeyId: t.arg({ type: 'ID', required: true }),
      teamId: t.arg({ type: 'ID', required: false })
    },
    resolve: async (query, _parent, { journeyId, teamId }, context) => {
      const journey = await prisma.journey.findUnique({
        where: { id: journeyId },
        include: {
          userJourneys: true,
          team: { include: { userTeams: true } }
        }
      })

      if (journey == null) {
        throw new GraphQLError('Journey not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      const ownerUserJourney = journey.userJourneys.find(
        (uj) => uj.role === UserJourneyRole.owner
      )
      if (ownerUserJourney == null) {
        throw new GraphQLError('Journey has no owner', {
          extensions: { code: 'BAD_REQUEST' }
        })
      }

      const alreadyOwns = ownerUserJourney.userId === context.user.id

      if (!alreadyOwns) {
        const ownerUser = await prismaUsers.user.findFirst({
          where: { userId: ownerUserJourney.userId },
          select: { email: true }
        })
        if (ownerUser != null && ownerUser.email != null) {
          throw new GraphQLError(
            'Journey owner is not an anonymous user; transfer is not permitted',
            { extensions: { code: 'FORBIDDEN' } }
          )
        }
      }

      let resolvedTeamId: string | null = null

      if (teamId != null) {
        const membership = await prisma.userTeam.findFirst({
          where: {
            teamId,
            userId: context.user.id,
            role: { in: [UserTeamRole.manager, UserTeamRole.member] }
          }
        })
        if (membership != null) {
          resolvedTeamId = teamId
        }
      }

      if (resolvedTeamId == null) {
        const ownedTeam = await prisma.userTeam.findFirst({
          where: {
            userId: context.user.id,
            role: UserTeamRole.manager
          },
          orderBy: { createdAt: 'asc' }
        })
        if (ownedTeam != null) {
          resolvedTeamId = ownedTeam.teamId
        }
      }

      if (resolvedTeamId == null) {
        const anyTeam = await prisma.userTeam.findFirst({
          where: { userId: context.user.id },
          orderBy: { createdAt: 'asc' }
        })
        if (anyTeam != null) {
          resolvedTeamId = anyTeam.teamId
        }
      }

      if (resolvedTeamId == null) {
        throw new GraphQLError('No team found for the current user', {
          extensions: { code: 'BAD_REQUEST' }
        })
      }

      if (journey.teamId === resolvedTeamId) {
        return await prisma.journey.findUniqueOrThrow({
          ...query,
          where: { id: journeyId }
        })
      }

      const oldTeamId = journey.teamId

      return await prisma.$transaction(async (tx) => {
        if (!alreadyOwns) {
          await tx.userJourney.deleteMany({
            where: { journeyId }
          })

          await tx.userJourney.create({
            data: {
              userId: context.user.id,
              journeyId,
              role: UserJourneyRole.owner
            }
          })
        }

        const updated = await tx.journey.update({
          ...query,
          where: { id: journeyId },
          data: { teamId: resolvedTeamId }
        })

        const remainingJourneys = await tx.journey.count({
          where: { teamId: oldTeamId }
        })
        if (remainingJourneys === 0) {
          await tx.userTeam.deleteMany({ where: { teamId: oldTeamId } })
          await tx.team
            .delete({ where: { id: oldTeamId } })
            .catch(() => undefined)
        }

        return updated
      })
    }
  })
)
