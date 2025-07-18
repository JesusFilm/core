import { VideoBlockSource as PrismaVideoSource } from '@core/prisma/journeys/client'

import { builder } from '../../../builder'

export const VideoBlockSource = builder.enumType(PrismaVideoSource, {
  name: 'VideoBlockSource'
})
