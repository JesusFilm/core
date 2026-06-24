import { Role as PrismaRole } from '@core/prisma/journeys/client'

import { builder } from '../../builder'

export const Role = builder.enumType(PrismaRole, {
  name: 'Role'
})
