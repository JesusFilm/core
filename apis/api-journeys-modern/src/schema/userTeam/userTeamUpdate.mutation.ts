import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { UserTeamUpdateInput } from './inputs'
import { UserTeamRef } from './userTeam'
import { Action, INCLUDE_USER_TEAM_ACL, userTeamAcl } from './userTeam.acl'

builder.mutationField('userTeamUpdate', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: UserTeamRef,
      nullable: false,
      override: { from: 'api-journeys' },
      args: {
        id: t.arg({ type: 'ID', required: true }),
        input: t.arg({ type: UserTeamUpdateInput, required: false })
      },
      resolve: async (query, _parent, args, context) => {
        const userTeam = await prisma.userTeam.findUnique({
          where: { id: String(args.id) },
          include: INCLUDE_USER_TEAM_ACL
        })

        if (userTeam == null)
          throw new GraphQLError('userTeam not found', {
            extensions: { code: 'NOT_FOUND' }
          })

        if (!userTeamAcl(Action.Update, userTeam, context.user))
          throw new GraphQLError('user is not allowed to update userTeam', {
            extensions: { code: 'FORBIDDEN' }
          })

        const data: { role?: 'manager' | 'member' } = {}
        if (args.input?.role != null) data.role = args.input.role

        return prisma.userTeam.update({
          ...query,
          where: { id: String(args.id) },
          data
        })
      }
    })
)
