import { builder } from '../../../builder'
import { BlockEventLabel } from '../../../enums'

export const SignUpBlockUpdateInput = builder.inputType(
  'SignUpBlockUpdateInput',
  {
    fields: (t) => ({
      parentBlockId: t.id({ required: false }),
      eventLabel: t.field({ type: BlockEventLabel, required: false }),
      submitIconId: t.id({ required: false }),
      submitLabel: t.string({ required: false })
    })
  }
)
