import { MediaRole as PrismaMediaRole } from '@core/prisma/media/client'

import { builder } from '../../builder'

export const MediaRole = builder.enumType(PrismaMediaRole, {
  name: 'MediaRole'
})
