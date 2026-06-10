import { Prisma, UserTeamRole, prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { JourneyCollectionRef } from './journeyCollection'

builder.queryField('journeyCollections', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: [JourneyCollectionRef],
      nullable: { list: false, items: true },
      override: { from: 'api-journeys' },
      args: {
        teamId: t.arg({ type: 'ID', required: true })
      },
      resolve: async (query, _parent, args, context) => {
        const userId = context.user.id

        const accessibleWhere: Prisma.JourneyCollectionWhereInput = {
          team: {
            userTeams: {
              some: {
                userId,
                role: UserTeamRole.manager
              }
            }
          }
        }

        return prisma.journeyCollection.findMany({
          ...query,
          where: {
            AND: [accessibleWhere, { teamId: String(args.teamId) }]
          }
        })
      }
    })
)
