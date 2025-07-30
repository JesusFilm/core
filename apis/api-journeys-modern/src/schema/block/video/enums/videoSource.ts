import { VideoBlockSource as PrismaVideoSource } from '.prisma/api-journeys-modern-client'

import { builder } from '../../../builder'

export const VideoBlockSource = builder.enumType(PrismaVideoSource, {
  name: 'VideoBlockSource'
})
