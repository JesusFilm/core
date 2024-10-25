import { builder } from '../../builder'

export const VideoEditionCreateInput = builder.inputType(
  'VideoEditionCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: true }),
      name: t.string({ required: false })
    })
  }
)
