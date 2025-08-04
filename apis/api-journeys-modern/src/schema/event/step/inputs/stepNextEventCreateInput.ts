import { builder } from '../../../builder'

export const StepNextEventCreateInput = builder.inputType(
  'StepNextEventCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      blockId: t.id({ required: true }),
      nextStepId: t.id({ required: true }),
      label: t.string({ required: false }),
      value: t.string({ required: false })
    })
  }
)
