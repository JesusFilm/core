import { builder } from '../../../builder'

export const RadioOptionBlockUpdateInput = builder.inputType(
  'RadioOptionBlockUpdateInput',
  {
    fields: (t) => ({
      parentBlockId: t.id({ required: false }),
      label: t.string({ required: false }),
      pollOptionImageBlockId: t.id({ required: false })
    })
  }
)
