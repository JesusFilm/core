import { builder } from '../../../builder'
import { VideoVariantDownloadQuality } from '../enums/videoVariantDownloadQuality'

export const VideoVariantDownloadCreateInput = builder.inputType(
  'VideoVariantDownloadCreateInput',
  {
    fields: (t) => ({
      id: t.string({ required: false }),
      assetId: t.string({ required: false }),
      videoVariantId: t.string({ required: true }),
      quality: t.field({ type: VideoVariantDownloadQuality, required: true }),
      size: t.float({ required: false }),
      height: t.int({ required: false }),
      width: t.int({ required: false }),
      bitrate: t.int({ required: false }),
      url: t.string({ required: true }),
      version: t.int({ required: false })
    })
  }
)
