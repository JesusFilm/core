import { ImageAspectRatio as PrismaImageAspectRatio } from '@core/prisma/media/client'

import { builder } from '../../../builder'

export const ImageAspectRatio = builder.enumType(PrismaImageAspectRatio, {
  name: 'ImageAspectRatio'
})
