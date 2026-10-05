import { builder } from '../../../builder'

export const StepBlockPositionUpdateInput = builder.inputType(
  'StepBlockPositionUpdateInput',
  {
    fields: (t) => ({
      id: t.id({ required: true }),
      x: t.int({ required: false }),
      y: t.int({ required: false })
    })
  }
)
