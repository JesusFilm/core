import { VideoBlockSource as PrismaVideoBlockSource } from '.prisma/api-journeys-modern-client'

import { builder } from '../builder'

export const VideoBlockSource = builder.enumType(PrismaVideoBlockSource, {
  name: 'VideoBlockSource'
})
