import { builder } from '../../../builder'

export const VideoOriginUpdateInput = builder.inputType(
  'VideoOriginUpdateInput',
  {
    fields: (t) => ({
      id: t.id({ required: true }),
      name: t.string({ required: false }),
      description: t.string({ required: false })
    })
  }
)
