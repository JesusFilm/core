import { builder } from '../../../builder'
import { VideoVariantDownloadQuality } from '../enums/videoVariantDownloadQuality'

export const VideoVariantDownloadUpdateInput = builder.inputType(
  'VideoVariantDownloadUpdateInput',
  {
    fields: (t) => ({
      id: t.string({ required: true }),
      assetId: t.string({ required: false }),
      videoVariantId: t.string({ required: false }),
      quality: t.field({ type: VideoVariantDownloadQuality, required: false }),
      size: t.float({ required: false }),
      height: t.int({ required: false }),
      width: t.int({ required: false }),
      bitrate: t.int({ required: false }),
      url: t.string({ required: false }),
      version: t.int({ required: false })
    })
  }
)
