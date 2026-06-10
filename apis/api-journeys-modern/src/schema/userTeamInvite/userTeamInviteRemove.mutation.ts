import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { UserTeamInviteRef } from './userTeamInvite'
import {
  Action,
  INCLUDE_USER_TEAM_INVITE_ACL,
  userTeamInviteAcl
} from './userTeamInvite.acl'

builder.mutationField('userTeamInviteRemove', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: UserTeamInviteRef,
      nullable: false,
      override: { from: 'api-journeys' },
      args: {
        id: t.arg({ type: 'ID', required: true })
      },
      resolve: async (query, _parent, args, context) => {
        const invite = await prisma.userTeamInvite.findUnique({
          where: { id: String(args.id) },
          include: INCLUDE_USER_TEAM_INVITE_ACL
        })

        if (invite == null)
          throw new GraphQLError('userTeamInvite not found', {
            extensions: { code: 'NOT_FOUND' }
          })

        if (invite.removedAt != null || invite.acceptedAt != null)
          throw new GraphQLError('userTeamInvite not found', {
            extensions: { code: 'NOT_FOUND' }
          })

        if (!userTeamInviteAcl(Action.Manage, invite, context.user))
          throw new GraphQLError(
            'user is not allowed to remove userTeamInvite',
            { extensions: { code: 'FORBIDDEN' } }
          )

        return prisma.userTeamInvite.update({
          ...query,
          where: { id: String(args.id) },
          data: { removedAt: new Date() }
        })
      }
    })
)
