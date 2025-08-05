import { builder } from '../../../builder'

export const RadioQuestionBlockUpdateInput = builder.inputType(
  'RadioQuestionBlockUpdateInput',
  {
    fields: (t) => ({
      parentBlockId: t.id({ required: false })
    })
  }
)
