import { GraphQLError } from 'graphql'

import { UserJourneyRole, prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { UserInviteRef } from './userInvite'

builder.mutationField('userInviteAcceptAll', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: [UserInviteRef],
      nullable: false,
      override: { from: 'api-journeys' },
      resolve: async (query, _parent, _args, context) => {
        const user = context.user

        if (user.email == null)
          throw new GraphQLError('User must have an email to accept invites', {
            extensions: { code: 'BAD_REQUEST' }
          })

        const pendingInvites = await prisma.userInvite.findMany({
          where: {
            email: user.email,
            acceptedAt: null,
            removedAt: null
          }
        })

        const redeemedInvites = await Promise.all(
          pendingInvites.map(async (invite) => {
            const [, redeemedInvite] = await prisma.$transaction([
              prisma.userJourney.upsert({
                where: {
                  journeyId_userId: {
                    journeyId: invite.journeyId,
                    userId: user.id
                  }
                },
                create: {
                  journey: { connect: { id: invite.journeyId } },
                  userId: user.id,
                  role: UserJourneyRole.editor
                },
                update: {
                  role: UserJourneyRole.editor
                }
              }),
              prisma.userInvite.update({
                ...query,
                where: { id: invite.id },
                data: { acceptedAt: new Date() }
              })
            ])
            return redeemedInvite
          })
        )

        return redeemedInvites
      }
    })
)
