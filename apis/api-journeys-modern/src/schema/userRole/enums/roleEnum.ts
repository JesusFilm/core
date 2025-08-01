import { Role } from '.prisma/api-journeys-modern-client'

import { builder } from '../../builder'

export const RoleEnum = builder.enumType(Role, {
  name: 'Role'
})
