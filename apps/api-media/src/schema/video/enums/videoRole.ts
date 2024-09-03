import { VideoRole as PrismaVideoRole } from '.prisma/api-media-client'

import { builder } from '../../builder'

export const VideoRole = builder.enumType(PrismaVideoRole, {
  name: 'VideoRole'
})
