import { VideoAdminUserRole as PrismaVideoAdminUserRole } from '.prisma/api-videos-client'

import { builder } from '../../builder'

export const VideoAdminUserRole = builder.enumType(PrismaVideoAdminUserRole, {
  name: 'VideoAdminUserRole'
})
