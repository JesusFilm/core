import { VideoLabel as PrismaVideoLabel } from '.prisma/api-videos-client'

import { builder } from '../../builder'

export const VideoLabel = builder.enumType(PrismaVideoLabel, {
  name: 'VideoLabel'
})
