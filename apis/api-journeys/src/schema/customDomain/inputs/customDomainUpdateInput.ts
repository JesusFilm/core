import { builder } from '../../builder'

export const CustomDomainUpdateInput = builder.inputType(
  'CustomDomainUpdateInput',
  {
    fields: (t) => ({
      journeyCollectionId: t.id({ required: false }),
      routeAllTeamJourneys: t.boolean({ required: false })
    })
  }
)
