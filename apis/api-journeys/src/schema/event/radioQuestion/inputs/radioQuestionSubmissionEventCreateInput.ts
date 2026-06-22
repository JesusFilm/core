import { builder } from '../../../builder'

export const RadioQuestionSubmissionEventCreateInput = builder.inputType(
  'RadioQuestionSubmissionEventCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      blockId: t.id({ required: true }),
      radioOptionBlockId: t.id({ required: true }),
      stepId: t.id({ required: false }),
      label: t.string({ required: false }),
      value: t.string({ required: false })
    })
  }
)
