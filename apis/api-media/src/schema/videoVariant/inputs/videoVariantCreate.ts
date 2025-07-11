import { builder } from '../../builder'

export const VideoVariantCreateInput = builder.inputType(
  'VideoVariantCreateInput',
  {
    fields: (t) => ({
      id: t.string({ required: true }),
      assetId: t.string({ required: false }),
      videoId: t.string({ required: true }),
      edition: t.string({ required: true }),
      hls: t.string({ required: false }),
      dash: t.string({ required: false }),
      share: t.string({ required: false }),
      duration: t.int({ required: false }),
      lengthInMilliseconds: t.int({ required: false }),
      languageId: t.string({ required: true }),
      slug: t.string({ required: true }),
      downloadable: t.boolean({ required: true }),
      published: t.boolean({ required: false, defaultValue: true }),
      muxVideoId: t.string({ required: false }),
      brightcoveId: t.string({ required: false }),
      version: t.int({ required: false })
    })
  }
)
