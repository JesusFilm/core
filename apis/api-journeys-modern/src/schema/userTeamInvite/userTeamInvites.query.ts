import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { UserTeamInviteRef } from './userTeamInvite'

builder.queryField('userTeamInvites', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: [UserTeamInviteRef],
      nullable: false,
      override: { from: 'api-journeys' },
      args: {
        teamId: t.arg({ type: 'ID', required: true })
      },
      resolve: async (query, _parent, args, context) => {
        return prisma.userTeamInvite.findMany({
          ...query,
          where: {
            removedAt: null,
            acceptedAt: null,
            teamId: String(args.teamId),
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
