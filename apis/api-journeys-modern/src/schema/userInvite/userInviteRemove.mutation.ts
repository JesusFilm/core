import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { UserInviteRef } from './userInvite'
import {
  INCLUDE_USER_INVITE_JOURNEY_ACL,
  UserInviteAction,
  userInviteAcl
} from './userInvite.acl'

builder.mutationField('userInviteRemove', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: UserInviteRef,
      nullable: false,
      override: { from: 'api-journeys' },
      args: {
        id: t.arg({ type: 'ID', required: true }),
        journeyId: t.arg({ type: 'ID', required: true })
      },
      resolve: async (query, _parent, args, context) => {
        const userInvite = await prisma.userInvite.findUnique({
          where: { id: String(args.id) },
          include: INCLUDE_USER_INVITE_JOURNEY_ACL
        })

        if (userInvite == null)
          throw new GraphQLError('userInvite not found', {
            extensions: { code: 'NOT_FOUND' }
          })

        if (
          !userInviteAcl(UserInviteAction.Manage, userInvite, context.user)
        )
          throw new GraphQLError(
            'user is not allowed to remove userInvite',
            { extensions: { code: 'FORBIDDEN' } }
          )

        return prisma.userInvite.update({
          ...query,
          where: { id: String(args.id) },
          data: {
            acceptedAt: null,
            removedAt: new Date()
          }
        })
      }
    })
)
