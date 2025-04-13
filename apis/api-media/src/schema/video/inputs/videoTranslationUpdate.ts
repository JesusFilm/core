import { builder } from '../../builder'

export const VideoTranslationUpdateInput = builder.inputType(
  'VideoTranslationUpdateInput',
  {
    fields: (t) => ({
      id: t.id({ required: true }),
      value: t.string({ required: false }),
      primary: t.boolean({ required: false }),
      languageId: t.string({ required: false })
    })
  }
)
