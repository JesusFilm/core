import { ImageAspectRatio as PrismaImageAspectRatio } from '.prisma/api-media-client'

import { builder } from '../../../builder'

export const ImageAspectRatio = builder.enumType(PrismaImageAspectRatio, {
  name: 'ImageAspectRatio'
})
