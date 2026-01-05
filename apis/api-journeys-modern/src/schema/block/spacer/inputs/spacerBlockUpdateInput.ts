import { builder } from '../../../builder'

export const SpacerBlockUpdateInput = builder.inputType(
  'SpacerBlockUpdateInput',
  {
    fields: (t) => ({
      parentBlockId: t.id({ required: false }),
      spacing: t.int({ required: false })
    })
  }
)
