import { builder } from '../../../builder'

export const JourneyViewEventCreateInput = builder.inputType(
  'JourneyViewEventCreateInput',
  {
    fields: (t) => ({
      id: t.string({ required: false }),
      journeyId: t.string({ required: true }),
      label: t.string({ required: false }),
      value: t.string({ required: false })
    })
  }
)
