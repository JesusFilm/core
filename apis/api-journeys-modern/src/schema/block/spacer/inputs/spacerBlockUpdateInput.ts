import { builder } from '../../../builder'
import { EventLabel } from '../../../enums'

export const SpacerBlockUpdateInput = builder.inputType(
  'SpacerBlockUpdateInput',
  {
    fields: (t) => ({
      parentBlockId: t.id({ required: false }),
      eventLabel: t.field({ type: EventLabel, required: false }),
      spacing: t.int({ required: false })
    })
  }
)
