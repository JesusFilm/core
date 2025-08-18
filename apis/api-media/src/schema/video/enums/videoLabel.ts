import { VideoLabel as PrismaVideoLabel } from '@core/prisma/media/client'

import { builder } from '../../builder'

export const VideoLabel = builder.enumType(PrismaVideoLabel, {
  name: 'VideoLabel'
})
