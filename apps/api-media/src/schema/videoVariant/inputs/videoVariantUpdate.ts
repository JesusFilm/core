import { builder } from '../../builder'

export const VideoVariantUpdateInput = builder.inputType(
  'VideoVariantUpdateInput',
  {
    fields: (t) => ({
      id: t.string({ required: true }),
      videoId: t.string({ required: false }),
      edition: t.string({ required: false }),
      hls: t.string({ required: false }),
      dash: t.string({ required: false }),
      share: t.string({ required: false }),
      duration: t.int({ required: false }),
      languageId: t.string({ required: false }),
      slug: t.string({ required: false }),
      downloadable: t.boolean({ required: false })
    })
  }
)
