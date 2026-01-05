import { builder } from '../../../builder'
import { EventLabel } from '../../../enums'

export const RadioQuestionBlockCreateInput = builder.inputType(
  'RadioQuestionBlockCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      journeyId: t.id({ required: true }),
      parentBlockId: t.id({ required: true }),
      eventLabel: t.field({ type: EventLabel, required: false })
    })
  }
)
