import { VideoRole as PrismaVideoRole } from '.prisma/api-videos-client'

import { builder } from '../../builder'

export const VideoRole = builder.enumType(PrismaVideoRole, {
  name: 'VideoRole'
})
