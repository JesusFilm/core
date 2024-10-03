import { builder } from '../../builder'

export const VideoSubtitleCreateInput = builder.inputType(
  'VideoSubtitleCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      videoId: t.string({ required: true }),
      edition: t.string({ required: true }),
      vttSrc: t.string({ required: false }),
      srtSrc: t.string({ required: false }),
      primary: t.boolean({ required: true }),
      languageId: t.string({ required: true })
    })
  }
)
