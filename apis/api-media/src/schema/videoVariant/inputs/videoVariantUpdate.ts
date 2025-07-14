import { builder } from '../../builder'

export const VideoVariantUpdateInput = builder.inputType(
  'VideoVariantUpdateInput',
  {
    fields: (t) => ({
      id: t.string({ required: true }),
      assetId: t.string({ required: false }),
      videoId: t.string({ required: false }),
      edition: t.string({ required: false }),
      hls: t.string({ required: false }),
      dash: t.string({ required: false }),
      share: t.string({ required: false }),
      duration: t.int({ required: false }),
      lengthInMilliseconds: t.int({ required: false }),
      languageId: t.string({ required: false }),
      slug: t.string({ required: false }),
      downloadable: t.boolean({ required: false }),
      published: t.boolean({ required: false }),
      muxVideoId: t.string({ required: false }),
      brightcoveId: t.string({ required: false }),
      version: t.int({ required: false })
    })
  }
)
