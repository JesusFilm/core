import { VideoBlockSource as PrismaVideoBlockSource } from '@core/prisma/journeys/client'

import { builder } from '../builder'

export const VideoBlockSource = builder.enumType(PrismaVideoBlockSource, {
  name: 'VideoBlockSource'
})
