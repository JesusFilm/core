import { builder } from '../../builder'

export const CustomDomainCreateInput = builder.inputType(
  'CustomDomainCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      teamId: t.string({ required: true }),
      name: t.string({ required: true }),
      journeyCollectionId: t.id({ required: false }),
      routeAllTeamJourneys: t.boolean({ required: false })
    })
  }
)
