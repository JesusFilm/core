import { VideoBlockObjectFit as PrismaVideoBlockObjectFit } from '@core/prisma/journeys/client'

import { builder } from '../../../builder'

export const VideoBlockObjectFit = builder.enumType(PrismaVideoBlockObjectFit, {
  name: 'VideoBlockObjectFit'
})
