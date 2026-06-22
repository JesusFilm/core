import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { UserJourneyRef } from './userJourney'
import { userJourneyDeleteAccessWhere } from './userJourney.acl'

builder.mutationField('userJourneyRemoveAll', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: [UserJourneyRef],
      nullable: false,
      args: {
        id: t.arg({ type: 'ID', required: true })
      },
      resolve: async (query, _parent, args, context) => {
        const journeyId = String(args.id)
        const accessible = userJourneyDeleteAccessWhere(context.user.id)

        const userJourneys = await prisma.userJourney.findMany({
          ...query,
          where: { AND: [accessible, { journeyId }] }
        })

        await prisma.userJourney.deleteMany({
          where: {
            AND: [accessible, { id: { in: userJourneys.map(({ id }) => id) } }]
          }
        })

        return userJourneys
      }
    })
)
