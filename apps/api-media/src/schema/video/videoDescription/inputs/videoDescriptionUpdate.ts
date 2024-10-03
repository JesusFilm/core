import { builder } from '../../../builder'

export const VideoDescriptionUpdateInput = builder.inputType(
  'VideoDescriptionUpdateInput',
  {
    fields: (t) => ({
      id: t.id({ required: true }),
      value: t.string({ required: false }),
      primary: t.boolean({ required: false }),
      languageId: t.string({ required: false })
    })
  }
)
