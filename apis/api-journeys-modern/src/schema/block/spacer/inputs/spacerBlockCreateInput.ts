import { builder } from '../../../builder'

export const SpacerBlockCreateInput = builder.inputType(
  'SpacerBlockCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      journeyId: t.id({ required: true }),
      parentBlockId: t.id({ required: true }),
      spacing: t.int({ required: false })
    })
  }
)
