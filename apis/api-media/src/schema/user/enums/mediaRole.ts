import { MediaRole as PrismaMediaRole } from '.prisma/api-media-client'

import { builder } from '../../builder'

export const MediaRole = builder.enumType(PrismaMediaRole, {
  name: 'MediaRole'
})
