import { builder } from '../../../builder'

export const VideoOriginCreateInput = builder.inputType(
  'VideoOriginCreateInput',
  {
    fields: (t) => ({
      name: t.string({ required: true }),
      description: t.string({ required: false })
    })
  }
)
