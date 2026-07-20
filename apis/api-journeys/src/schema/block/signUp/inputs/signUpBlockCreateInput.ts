import { builder } from '../../../builder'

export const SignUpBlockCreateInput = builder.inputType(
  'SignUpBlockCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      journeyId: t.id({ required: true }),
      parentBlockId: t.id({ required: true }),
      submitLabel: t.string({ required: true })
    })
  }
)
