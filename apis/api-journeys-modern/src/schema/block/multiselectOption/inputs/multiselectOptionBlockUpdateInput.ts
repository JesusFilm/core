import { builder } from '../../../builder'
import { BlockEventLabel } from '../../../enums'

export const MultiselectOptionBlockUpdateInput = builder.inputType(
  'MultiselectOptionBlockUpdateInput',
  {
    fields: (t) => ({
      parentBlockId: t.id({ required: false }),
      eventLabel: t.field({ type: BlockEventLabel, required: false }),
      label: t.string({ required: false })
    })
  }
)
