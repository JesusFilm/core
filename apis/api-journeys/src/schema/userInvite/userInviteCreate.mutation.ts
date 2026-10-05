import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { env } from '../../env'
import { queue as emailQueue } from '../../workers/email/queue'
import { builder } from '../builder'
import { logger } from '../logger'

import { UserInviteCreateInput } from './inputs'
import { UserInviteRef } from './userInvite'
import {
  INCLUDE_USER_INVITE_JOURNEY_ACL,
  UserInviteAction,
  userInviteAcl
} from './userInvite.acl'

builder.mutationField('userInviteCreate', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: UserInviteRef,
      nullable: true,
      args: {
        journeyId: t.arg({ type: 'ID', required: true }),
        input: t.arg({ type: UserInviteCreateInput, required: false })
      },
      resolve: async (query, _parent, args, context) => {
        if (args.input == null)
          throw new GraphQLError('input is required', {
            extensions: { code: 'BAD_USER_INPUT' }
          })

        const journeyId = String(args.journeyId)

        return prisma.$transaction(async (tx) => {
          const userInvite = await tx.userInvite.upsert({
            where: {
              journeyId_email: { journeyId, email: args.input!.email }
            },
            create: {
              journey: { connect: { id: journeyId } },
              senderId: context.user.id,
              email: args.input!.email
            },
            update: {
              senderId: context.user.id,
              acceptedAt: null,
              removedAt: null
            },
            include: {
              ...INCLUDE_USER_INVITE_JOURNEY_ACL,
              journey: {
                include: {
                  userJourneys: true,
                  team: { include: { userTeams: true } },
                  primaryImageBlock: true
                }
              }
            }
          })

          if (!userInviteAcl(UserInviteAction.Create, userInvite, context.user))
            throw new GraphQLError('user is not allowed to create userInvite', {
              extensions: { code: 'FORBIDDEN' }
            })

          const { id: _id, ...sender } = context.user
          const url = `${env.JOURNEYS_ADMIN_URL}/journeys/${journeyId}`
          void emailQueue
            .add(
              'journey-edit-invite',
              {
                email: args.input!.email,
                url,
                journey: userInvite.journey,
                sender
              },
              {
                removeOnComplete: true,
                removeOnFail: { age: 24 * 3600 }
              }
            )
            .catch((err) =>
              logger.error(err, 'failed to enqueue journey-edit-invite email')
            )

          return tx.userInvite.findUniqueOrThrow({
            ...query,
            where: { id: userInvite.id }
          })
        })
      }
    })
)
