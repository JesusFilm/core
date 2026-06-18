import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { TeamCreateInput } from './inputs'
import { TeamRef } from './team'

builder.mutationField('teamCreate', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: TeamRef,
      nullable: false,
      args: {
        input: t.arg({ type: TeamCreateInput, required: false })
      },
      resolve: async (query, _parent, args, context) => {
        return prisma.team.create({
          ...query,
          data: {
            title: args.input?.title ?? '',
            publicTitle: args.input?.publicTitle ?? null,
            userTeams: {
              create: { userId: context.user.id, role: 'manager' }
            }
          }
        })
      }
    })
)
