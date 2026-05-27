import { GraphQLError } from 'graphql'

import { prisma, UserTeamRole } from '@core/prisma/journeys/client'

import { queue as emailQueue } from '../../workers/email/queue'
import { builder } from '../builder'
import { logger } from '../logger'

import { UserTeamInviteRef } from './userTeamInvite'

builder.mutationField('userTeamInviteAcceptAll', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: [UserTeamInviteRef],
      nullable: false,
      override: { from: 'api-journeys' },
      resolve: async (query, _parent, _args, context) => {
        const user = context.user!
        if (user.email == null)
          throw new GraphQLError(
            'User must have an email to accept invites',
            { extensions: { code: 'BAD_REQUEST' } }
          )

        const pendingInvites = await prisma.userTeamInvite.findMany({
          where: {
            email: user.email,
            acceptedAt: null,
            removedAt: null
          }
        })

        const { id: _id, emailVerified: _ev, ...sender } = user

        const redeemed = await Promise.all(
          pendingInvites.map(async (invite) => {
            const [, redeemedInvite] = await prisma.$transaction([
              prisma.userTeam.upsert({
                where: {
                  teamId_userId: {
                    teamId: invite.teamId,
                    userId: user.id
                  }
                },
                create: {
                  team: { connect: { id: invite.teamId } },
                  userId: user.id,
                  role: UserTeamRole.member
                },
                update: {
                  role: UserTeamRole.member
                }
              }),
              prisma.userTeamInvite.update({
                ...query,
                where: { id: invite.id },
                data: {
                  acceptedAt: new Date(),
                  receipientId: user.id
                }
              })
            ])

            void prisma.team
              .findUnique({
                where: { id: invite.teamId },
                include: { userTeams: true }
              })
              .then((team) => {
                if (team == null) return
                return emailQueue.add(
                  'team-invite-accepted',
                  { team, sender },
                  {
                    removeOnComplete: true,
                    removeOnFail: { age: 24 * 3600 }
                  }
                )
              })
              .catch((err) =>
                logger.error(
                  err,
                  'failed to enqueue team-invite-accepted email'
                )
              )

            return redeemedInvite
          })
        )

        return redeemed
      }
    })
)
