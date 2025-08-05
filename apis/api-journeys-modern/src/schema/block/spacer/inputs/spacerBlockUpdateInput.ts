import { builder } from '../../../builder'

export const SpacerBlockUpdateInput = builder.inputType(
  'SpacerBlockUpdateInput',
  {
    fields: (t) => ({
      spacing: t.int({ required: false })
    })
  }
)
