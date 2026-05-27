import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { UserTeamFilterInput } from './inputs'
import { UserTeamRef } from './userTeam'

builder.queryField('userTeams', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: [UserTeamRef],
      nullable: false,
      override: { from: 'api-journeys' },
      args: {
        teamId: t.arg({ type: 'ID', required: true }),
        where: t.arg({ type: UserTeamFilterInput, required: false })
      },
      resolve: async (query, _parent, args, context) => {
        const roleFilter =
          args.where?.role != null ? { role: { in: args.where.role } } : {}

        return prisma.userTeam.findMany({
          ...query,
          where: {
            teamId: String(args.teamId),
            ...roleFilter,
            team: {
              userTeams: {
                some: { userId: context.user!.id }
              }
            }
          }
        })
      }
    })
)
