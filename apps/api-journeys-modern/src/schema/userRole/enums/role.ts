import { Role as PrismaRole } from '.prisma/api-journeys-modern-client'

import { builder } from '../../builder'

export const Role = builder.enumType(PrismaRole, {
  name: 'Role'
})
