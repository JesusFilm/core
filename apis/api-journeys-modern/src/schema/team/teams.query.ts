import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { TeamRef } from './team'

builder.queryField('teams', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: [TeamRef],
      nullable: false,
      override: { from: 'api-journeys' },
      resolve: async (query, _parent, _args, context) => {
        return prisma.team.findMany({
          ...query,
          where: {
            userTeams: {
              some: { userId: context.user!.id }
            }
          }
        })
      }
    })
)
