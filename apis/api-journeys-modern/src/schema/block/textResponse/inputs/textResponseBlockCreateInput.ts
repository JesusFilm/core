import { builder } from '../../../builder'

export const TextResponseBlockCreateInput = builder.inputType(
  'TextResponseBlockCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      journeyId: t.id({ required: true }),
      parentBlockId: t.id({ required: true }),
      label: t.string({ required: true })
    })
  }
)
