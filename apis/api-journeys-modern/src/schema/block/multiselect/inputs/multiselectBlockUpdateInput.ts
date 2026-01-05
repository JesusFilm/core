import { builder } from '../../../builder'
import { EventLabel } from '../../../enums'

export const MultiselectBlockUpdateInput = builder.inputType(
  'MultiselectBlockUpdateInput',
  {
    fields: (t) => ({
      parentBlockId: t.id({ required: false }),
      eventLabel: t.field({ type: EventLabel, required: false }),
      min: t.int({ required: false }),
      max: t.int({ required: false })
    })
  }
)
