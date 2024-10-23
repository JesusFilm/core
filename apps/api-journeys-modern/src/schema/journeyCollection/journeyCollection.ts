import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

builder.prismaObject('JourneyCollection', {
  fields: (t) => ({
    id: t.exposeID('id'),
    team: t.relation('team'),
    title: t.exposeString('title', { nullable: true }),
    customDomains: t.relation('customDomains'),
    journeys: t.prismaField({
      type: ['Journey'],
      resolve: async (query, parent) => {
        return await prisma.journey.findMany({
          ...query,
          where: {
            journeyCollectionJourneys: {
              some: { journeyCollectionId: parent.id }
            }
          }
        })
      }
    })
  })
})
