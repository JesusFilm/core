import { prisma } from '../../lib/prisma'
import { builder } from '../builder'
import { JourneyRef } from '../journey/journey'

export const JourneyCollectionRef = builder.prismaObject('JourneyCollection', {
  description: 'A collection of journeys associated with a team',
  shareable: true,
  fields: (t) => ({
    id: t.exposeID('id'),
    title: t.exposeString('title', { nullable: true }),
    team: t.relation('team'),
    customDomains: t.relation('customDomains'),
    journeys: t.field({
      type: [JourneyRef],
      resolve: async (journeyCollection) => {
        const journeys = await prisma.journey.findMany({
          where: {
            journeyCollectionJourneys: {
              some: { journeyCollectionId: journeyCollection.id }
            }
          },
          include: {
            journeyCollectionJourneys: {
              where: { journeyCollectionId: journeyCollection.id },
              orderBy: { order: 'asc' }
            }
          }
        })

        // Sort journeys by their order in the collection
        return journeys.sort((a, b) => {
          const orderA = a.journeyCollectionJourneys[0]?.order ?? 0
          const orderB = b.journeyCollectionJourneys[0]?.order ?? 0
          return orderA - orderB
        })
      }
    })
  })
})

// Extend Journey type to add journeyCollections field (avoids circular dependency)
builder.prismaObjectField('Journey', 'journeyCollections', (t) =>
  t.field({
    type: [JourneyCollectionRef],
    nullable: false,
    select: (_args, _ctx, nestedSelection) => ({
      journeyCollectionJourneys: {
        include: {
          journeyCollection: nestedSelection(true)
        }
      }
    }),
    resolve: (journey) => {
      return journey.journeyCollectionJourneys.map(
        (jcj) => jcj.journeyCollection
      )
    }
  })
)
