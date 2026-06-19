import { builder } from '../builder'

export const JourneyCustomizationFieldInput = builder.inputType(
  'JourneyCustomizationFieldInput',
  {
    fields: (t) => ({
      id: t.id({ required: true }),
      key: t.string({ required: true }),
      value: t.string({ required: false })
    })
  }
)
