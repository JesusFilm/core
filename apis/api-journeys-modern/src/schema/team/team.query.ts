import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { TeamRef } from './team'
import { Action, INCLUDE_TEAM_ACL, teamAcl } from './team.acl'

builder.queryField('team', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: TeamRef,
      nullable: false,
      args: {
        id: t.arg({ type: 'ID', required: true })
      },
      resolve: async (query, _parent, args, context) => {
        const team = await prisma.team.findUnique({
          where: { id: String(args.id) },
          include: INCLUDE_TEAM_ACL
        })

        if (team == null)
          throw new GraphQLError('team not found', {
            extensions: { code: 'NOT_FOUND' }
          })

        if (!teamAcl(Action.Read, team, context.user))
          throw new GraphQLError('user is not allowed to view team', {
            extensions: { code: 'FORBIDDEN' }
          })

        return prisma.team.findUniqueOrThrow({
          ...query,
          where: { id: String(args.id) }
        })
      }
    })
)
