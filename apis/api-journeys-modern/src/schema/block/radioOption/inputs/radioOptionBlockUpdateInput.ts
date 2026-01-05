import { builder } from '../../../builder'
import { EventLabel } from '../../../enums'

export const RadioOptionBlockUpdateInput = builder.inputType(
  'RadioOptionBlockUpdateInput',
  {
    fields: (t) => ({
      parentBlockId: t.id({ required: false }),
      eventLabel: t.field({ type: EventLabel, required: false }),
      label: t.string({ required: false }),
      pollOptionImageBlockId: t.id({ required: false })
    })
  }
)
