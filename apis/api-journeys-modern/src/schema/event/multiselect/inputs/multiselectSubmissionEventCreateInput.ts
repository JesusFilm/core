import { builder } from '../../../builder'

export const MultiselectSubmissionEventCreateInput = builder.inputType(
  'MultiselectSubmissionEventCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      blockId: t.id({ required: true }),
      stepId: t.id({ required: false }),
      label: t.string({ required: false }),
      values: t.stringList({ required: true })
    })
  }
)
