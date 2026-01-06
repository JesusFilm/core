import { builder } from '../../../builder'

export const MultiselectOptionBlockCreateInput = builder.inputType(
  'MultiselectOptionBlockCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      journeyId: t.id({ required: true }),
      parentBlockId: t.id({ required: true }),
      label: t.string({ required: true })
    })
  }
)
