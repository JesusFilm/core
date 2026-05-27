import { JourneyStatus, prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { JourneyRef } from './journey'
import { Action, journeyAcl, journeyReadAccessWhere } from './journey.acl'

builder.mutationField('journeysDelete', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: [JourneyRef],
      nullable: { list: false, items: true },
      override: { from: 'api-journeys' },
      args: {
        ids: t.arg({ type: ['ID'], required: true })
      },
      resolve: async (query, _parent, args, context) => {
        const userId = context.user.id
        const ids = args.ids.map(String)

        const journeys = await prisma.journey.findMany({
          where: {
            AND: [
              journeyReadAccessWhere(userId, context.user as typeof context.user & { roles?: string[] }),
              { id: { in: ids } }
            ]
          },
          include: {
            userJourneys: true,
            team: { include: { userTeams: true } }
          }
        })

        const manageableJourneys = journeys.filter((j) =>
          journeyAcl(Action.Manage, j, context.user)
        )

        return await Promise.all(
          manageableJourneys.map(async (journey) =>
            prisma.journey.update({
              ...query,
              where: { id: journey.id, updatedAt: journey.updatedAt },
              data: {
                status: JourneyStatus.deleted,
                deletedAt: new Date(),
                updatedAt: journey.updatedAt
              }
            })
          )
        )
      }
    })
)
