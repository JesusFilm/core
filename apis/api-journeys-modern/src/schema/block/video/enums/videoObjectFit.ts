import { VideoBlockObjectFit as PrismaVideoBlockObjectFit } from '.prisma/api-journeys-modern-client'

import { builder } from '../../../builder'

export const VideoBlockObjectFit = builder.enumType(PrismaVideoBlockObjectFit, {
  name: 'VideoBlockObjectFit'
})
