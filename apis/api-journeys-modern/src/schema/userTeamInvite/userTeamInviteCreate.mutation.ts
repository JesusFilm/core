import { GraphQLError } from 'graphql'

import { prisma, Team } from '@core/prisma/journeys/client'

import { queue as emailQueue } from '../../workers/email/queue'
import { builder } from '../builder'
import { logger } from '../logger'

import { UserTeamInviteCreateInput } from './inputs'
import { UserTeamInviteRef } from './userTeamInvite'
import {
  Action,
  INCLUDE_USER_TEAM_INVITE_ACL,
  userTeamInviteAcl
} from './userTeamInvite.acl'

builder.mutationField('userTeamInviteCreate', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: UserTeamInviteRef,
      nullable: true,
      override: { from: 'api-journeys' },
      args: {
        teamId: t.arg({ type: 'ID', required: true }),
        input: t.arg({ type: UserTeamInviteCreateInput, required: false })
      },
      resolve: async (query, _parent, args, context) => {
        if (args.input == null)
          throw new GraphQLError('input is required', {
            extensions: { code: 'BAD_USER_INPUT' }
          })

        return prisma.$transaction(async (tx) => {
          const userTeamInvite = await tx.userTeamInvite.upsert({
            where: {
              teamId_email: {
                teamId: String(args.teamId),
                email: args.input!.email
              }
            },
            create: {
              email: args.input!.email,
              senderId: context.user!.id,
              team: { connect: { id: String(args.teamId) } }
            },
            update: {
              senderId: context.user!.id,
              acceptedAt: null,
              receipientId: null,
              removedAt: null
            },
            include: INCLUDE_USER_TEAM_INVITE_ACL
          })

          if (!userTeamInviteAcl(Action.Create, userTeamInvite, context.user!))
            throw new GraphQLError(
              'user is not allowed to create userTeamInvite',
              { extensions: { code: 'FORBIDDEN' } }
            )

          const user = context.user!
          const { id: _id, emailVerified: _ev, ...sender } = user
          void emailQueue
            .add(
              'team-invite',
              {
                team: userTeamInvite.team as unknown as Team,
                email: args.input!.email,
                sender
              },
              {
                removeOnComplete: true,
                removeOnFail: { age: 24 * 3600 }
              }
            )
            .catch((err) =>
              logger.error(err, 'failed to enqueue team-invite email')
            )

          return tx.userTeamInvite.findUniqueOrThrow({
            ...query,
            where: { id: userTeamInvite.id }
          })
        })
      }
    })
)
