import { builder } from '../../../builder'
import { BlockEventLabel } from '../../../enums'

export const RadioOptionBlockUpdateInput = builder.inputType(
  'RadioOptionBlockUpdateInput',
  {
    fields: (t) => ({
      parentBlockId: t.id({ required: false }),
      eventLabel: t.field({ type: BlockEventLabel, required: false }),
      label: t.string({ required: false }),
      pollOptionImageBlockId: t.id({ required: false })
    })
  }
)
