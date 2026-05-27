import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { UserTeamRef } from './userTeam'
import { Action, INCLUDE_USER_TEAM_ACL, userTeamAcl } from './userTeam.acl'

builder.queryField('userTeam', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: UserTeamRef,
      nullable: false,
      override: { from: 'api-journeys' },
      args: {
        id: t.arg({ type: 'ID', required: true })
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

        if (!userTeamAcl(Action.Read, userTeam, context.user!))
          throw new GraphQLError('user is not allowed to view userTeam', {
            extensions: { code: 'FORBIDDEN' }
          })

        return prisma.userTeam.findUniqueOrThrow({
          ...query,
          where: { id: String(args.id) }
        })
      }
    })
)
