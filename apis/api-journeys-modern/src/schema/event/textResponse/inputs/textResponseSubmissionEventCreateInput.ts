import { builder } from '../../../builder'

export const TextResponseSubmissionEventCreateInput = builder.inputType(
  'TextResponseSubmissionEventCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      blockId: t.id({ required: true }),
      stepId: t.id({ required: false }),
      label: t.string({ required: false }),
      value: t.string({ required: true })
    })
  }
)
