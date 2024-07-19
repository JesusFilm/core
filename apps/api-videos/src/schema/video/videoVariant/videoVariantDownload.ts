import { builder } from '../../builder'

enum VideoVariantDownloadQuality {
  low = 'low',
  high = 'high'
}

builder.enumType(VideoVariantDownloadQuality, {
  name: 'VideoVariantDownloadQuality'
})

export const VideoVariantDownload = builder.prismaObject(
  'VideoVariantDownload',
  {
    fields: (t) => ({
      quality: t.field({
        type: VideoVariantDownloadQuality,
        resolve: (parent) => VideoVariantDownloadQuality[parent.quality]
      }),
      size: t.field({
        type: 'Float',
        resolve: (parent) => parent.size ?? 0
      }),
      url: t.exposeString('url')
    })
  }
)
