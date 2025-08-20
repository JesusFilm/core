import { builder } from '../../builder'

export const JourneyCollectionUpdateInput = builder.inputType(
  'JourneyCollectionUpdateInput',
  {
    fields: (t) => ({
      title: t.string({ required: false }),
      journeyIds: t.stringList({ required: false })
    })
  }
)
