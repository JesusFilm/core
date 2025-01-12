import { builder } from '../../builder'

export const VideoEditionCreateInput = builder.inputType(
  'VideoEditionCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      name: t.string({ required: true }),
      videoId: t.string({ required: true })
    })
  }
)
