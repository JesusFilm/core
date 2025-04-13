import { VideoLabel as PrismaVideoLabel } from '.prisma/api-media-client'

import { builder } from '../../builder'

export const VideoLabel = builder.enumType(PrismaVideoLabel, {
  name: 'VideoLabel'
})
