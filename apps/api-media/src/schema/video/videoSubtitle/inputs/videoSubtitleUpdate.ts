import { builder } from '../../../builder'

export const VideoSubtitleUpdateInput = builder.inputType(
  'VideoSubtitleUpdateInput',
  {
    fields: (t) => ({
      id: t.id({ required: true }),
      edition: t.string({ required: true }),
      vttSrc: t.string({ required: false }),
      srtSrc: t.string({ required: false }),
      primary: t.boolean({ required: false }),
      languageId: t.string({ required: false })
    })
  }
)
