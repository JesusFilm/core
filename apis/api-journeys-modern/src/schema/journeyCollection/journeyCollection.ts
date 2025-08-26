import { builder } from '../builder'
import { JourneyRef } from '../journey/journey'

export const JourneyCollectionRef = builder.prismaObject('JourneyCollection', {
  shareable: true,
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    title: t.exposeString('title', { nullable: true }),
    team: t.relation('team', { nullable: false }),
    customDomains: t.relation('customDomains', { nullable: true }),
    journeys: t.field({
      type: [JourneyRef],
      select: {
        journeyCollectionJourneys: {
          include: {
            journey: true
          },
          orderBy: { order: 'asc' }
        }
      },
      resolve: async ({ journeyCollectionJourneys }) => {
        return journeyCollectionJourneys.map((jcj) => jcj.journey)
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
