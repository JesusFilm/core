import { builder } from '../../builder'

export const JourneyCollectionCreateInput = builder.inputType(
  'JourneyCollectionCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      teamId: t.string({ required: true }),
      title: t.string({ required: false }),
      journeyIds: t.stringList({ required: false })
    })
  }
)
