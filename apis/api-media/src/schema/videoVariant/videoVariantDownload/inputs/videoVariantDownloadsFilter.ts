import { DateTimeFilter, builder } from '../../../builder'
import { VideoVariantDownloadQuality } from '../enums/videoVariantDownloadQuality'

export const VideoVariantDownloadsFilter = builder.inputType(
  'VideoVariantDownloadsFilter',
  {
    fields: (t) => ({
      updatedAt: t.field({ type: DateTimeFilter, required: false }),
      videoVariantId: t.id({ required: false }),
      quality: t.field({ type: VideoVariantDownloadQuality, required: false })
    })
  }
)
