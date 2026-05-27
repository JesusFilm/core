import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { UserInviteRef } from './userInvite'
import { userInviteReadAccessWhere } from './userInvite.acl'

builder.queryField('userInvites', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: [UserInviteRef],
      nullable: true,
      override: { from: 'api-journeys' },
      args: {
        journeyId: t.arg({ type: 'ID', required: true })
      },
      resolve: async (query, _parent, args, context) => {
        const accessible = userInviteReadAccessWhere(context.user)

        return prisma.userInvite.findMany({
          ...query,
          where: {
            AND: [
              accessible,
              {
                journeyId: String(args.journeyId),
                removedAt: null,
                acceptedAt: null
              }
            ]
          }
        })
      }
    })
)
