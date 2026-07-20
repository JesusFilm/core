import { builder } from '../../../builder'

export const MultiselectBlockUpdateInput = builder.inputType(
  'MultiselectBlockUpdateInput',
  {
    fields: (t) => ({
      parentBlockId: t.id({ required: false }),
      min: t.int({ required: false }),
      max: t.int({ required: false })
    })
  }
)
