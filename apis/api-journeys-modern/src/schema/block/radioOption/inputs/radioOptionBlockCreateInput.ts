import { builder } from '../../../builder'
import { BlockEventLabel } from '../../../enums'

export const RadioOptionBlockCreateInput = builder.inputType(
  'RadioOptionBlockCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      journeyId: t.id({ required: true }),
      parentBlockId: t.id({ required: true }),
      eventLabel: t.field({ type: BlockEventLabel, required: false }),
      label: t.string({ required: true })
    })
  }
)
