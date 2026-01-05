import { builder } from '../../../builder'
import { EventLabel } from '../../../enums'

export const SignUpBlockUpdateInput = builder.inputType(
  'SignUpBlockUpdateInput',
  {
    fields: (t) => ({
      parentBlockId: t.id({ required: false }),
      eventLabel: t.field({ type: EventLabel, required: false }),
      submitIconId: t.id({ required: false }),
      submitLabel: t.string({ required: false })
    })
  }
)
