import { builder } from '../../../builder'
import { EventLabel } from '../../../enums'

export const TextResponseBlockCreateInput = builder.inputType(
  'TextResponseBlockCreateInput',
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
