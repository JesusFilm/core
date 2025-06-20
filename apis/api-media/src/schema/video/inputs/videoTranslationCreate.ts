import { builder } from '../../builder'

export const VideoTranslationCreateInput = builder.inputType(
  'VideoTranslationCreateInput',
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
