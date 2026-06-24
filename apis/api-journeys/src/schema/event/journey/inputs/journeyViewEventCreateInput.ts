import { builder } from '../../../builder'

export const JourneyViewEventCreateInput = builder.inputType(
  'JourneyViewEventCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      journeyId: t.id({ required: true }),
      label: t.string({ required: false }),
      value: t.id({ required: false })
    })
  }
)
