import { VideoVariantDownloadQuality as PrismaVideoVariantDownloadQuality } from '.prisma/api-media-client'

import { builder } from '../../../builder'

export const VideoVariantDownloadQuality = builder.enumType(
  PrismaVideoVariantDownloadQuality,
  {
    name: 'VideoVariantDownloadQuality'
  }
)
