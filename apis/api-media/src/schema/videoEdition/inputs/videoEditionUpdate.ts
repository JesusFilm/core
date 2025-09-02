import { builder } from '../../builder'

export const VideoEditionUpdateInput = builder.inputType(
  'VideoEditionUpdateInput',
  {
    fields: (t) => ({
      id: t.id({ required: true }),
      name: t.string({ required: false })
    })
  }
)
