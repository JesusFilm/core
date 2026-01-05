import { builder } from '../../../builder'
import { EventLabel } from '../../../enums'

export const RadioOptionBlockCreateInput = builder.inputType(
  'RadioOptionBlockCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      journeyId: t.id({ required: true }),
      parentBlockId: t.id({ required: true }),
      eventLabel: t.field({ type: EventLabel, required: false }),
      label: t.string({ required: true })
    })
  }
)
