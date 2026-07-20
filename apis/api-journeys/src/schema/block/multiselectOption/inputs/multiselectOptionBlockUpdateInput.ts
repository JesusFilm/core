import { builder } from '../../../builder'

export const MultiselectOptionBlockUpdateInput = builder.inputType(
  'MultiselectOptionBlockUpdateInput',
  {
    fields: (t) => ({
      parentBlockId: t.id({ required: false }),
      label: t.string({ required: false })
    })
  }
)
