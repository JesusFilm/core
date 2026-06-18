import { builder } from '../../../builder'

export const StepViewEventCreateInput = builder.inputType(
  'StepViewEventCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      blockId: t.id({ required: true }),
      value: t.string({ required: false })
    })
  }
)
