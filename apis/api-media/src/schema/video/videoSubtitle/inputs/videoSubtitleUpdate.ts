import { builder } from '../../../builder'

export const VideoSubtitleUpdateInput = builder.inputType(
  'VideoSubtitleUpdateInput',
  {
    fields: (t) => ({
      id: t.id({ required: true }),
      edition: t.string({ required: true }),
      vttSrc: t.string({ required: false }),
      vttAssetId: t.id({ required: false }),
      vttVersion: t.int({ required: false }),
      srtSrc: t.string({ required: false }),
      srtAssetId: t.id({ required: false }),
      srtVersion: t.int({ required: false }),
      primary: t.boolean({ required: false }),
      languageId: t.string({ required: false })
    })
  }
)
