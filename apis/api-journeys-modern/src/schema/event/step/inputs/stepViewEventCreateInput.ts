import { builder } from '../../../builder'

export const StepViewEventCreateInput = builder.inputType(
  'StepViewEventCreateInput',
  {
    fields: (t) => ({
      id: t.string({ required: false }),
      blockId: t.string({ required: true }),
      value: t.string({ required: false })
    })
  }
)
