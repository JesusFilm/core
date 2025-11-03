import { builder } from '../../../builder'

export const SignUpBlockUpdateInput = builder.inputType(
  'SignUpBlockUpdateInput',
  {
    fields: (t) => ({
      parentBlockId: t.id({ required: false }),
      submitIconId: t.id({ required: false }),
      submitLabel: t.string({ required: false })
    })
  }
)
