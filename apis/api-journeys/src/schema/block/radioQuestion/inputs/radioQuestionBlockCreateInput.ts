import { builder } from '../../../builder'

export const RadioQuestionBlockCreateInput = builder.inputType(
  'RadioQuestionBlockCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      journeyId: t.id({ required: true }),
      parentBlockId: t.id({ required: true })
    })
  }
)
