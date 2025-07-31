import { builder } from '../../../builder'

export const StepPreviousEventCreateInput = builder.inputType(
  'StepPreviousEventCreateInput',
  {
    fields: (t) => ({
      id: t.string({ required: false }),
      blockId: t.string({ required: true }),
      previousStepId: t.string({ required: true }),
      label: t.string({ required: false }),
      value: t.string({ required: false })
    })
  }
)
