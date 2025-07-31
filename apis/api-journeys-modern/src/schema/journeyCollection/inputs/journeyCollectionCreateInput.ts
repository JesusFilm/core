import { builder } from '../../builder'

export const JourneyCollectionCreateInput = builder.inputType(
  'JourneyCollectionCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      teamId: t.id({ required: true }),
      title: t.string({ required: false }),
      journeyIds: t.idList({ required: false })
    })
  }
)
