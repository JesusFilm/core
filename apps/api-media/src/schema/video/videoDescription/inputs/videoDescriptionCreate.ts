import { builder } from '../../../builder'

export const VideoDescriptionCreateInput = builder.inputType(
  'VideoDescriptionCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      videoId: t.string({ required: true }),
      value: t.string({ required: true }),
      primary: t.boolean({ required: true }),
      languageId: t.string({ required: true })
    })
  }
)
