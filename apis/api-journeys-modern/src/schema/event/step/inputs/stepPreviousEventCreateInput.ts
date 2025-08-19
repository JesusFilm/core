import { builder } from '../../../builder'

export const StepPreviousEventCreateInput = builder.inputType(
  'StepPreviousEventCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      blockId: t.id({ required: true }),
      previousStepId: t.id({ required: true }),
      label: t.string({ required: false }),
      value: t.string({ required: false })
    })
  }
)
