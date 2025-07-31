import { builder } from '../../../builder'

export const StepNextEventCreateInput = builder.inputType(
  'StepNextEventCreateInput',
  {
    fields: (t) => ({
      id: t.string({ required: false }),
      blockId: t.string({ required: true }),
      nextStepId: t.string({ required: true }),
      label: t.string({ required: false }),
      value: t.string({ required: false })
    })
  }
)
