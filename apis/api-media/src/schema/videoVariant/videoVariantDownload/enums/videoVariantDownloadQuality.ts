import { VideoVariantDownloadQuality as PrismaVideoVariantDownloadQuality } from '@core/prisma/media/client'

import { builder } from '../../../builder'

export const VideoVariantDownloadQuality = builder.enumType(
  PrismaVideoVariantDownloadQuality,
  {
    name: 'VideoVariantDownloadQuality'
  }
)
