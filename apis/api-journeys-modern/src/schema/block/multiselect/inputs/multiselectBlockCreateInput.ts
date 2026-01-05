import { builder } from '../../../builder'
import { EventLabel } from '../../../enums'

export const MultiselectBlockCreateInput = builder.inputType(
  'MultiselectBlockCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      journeyId: t.id({ required: true }),
      parentBlockId: t.id({ required: true }),
      eventLabel: t.field({ type: EventLabel, required: false })
    })
  }
)
