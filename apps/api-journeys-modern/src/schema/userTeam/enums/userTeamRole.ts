import { UserTeamRole as PrismaUserTeamRole } from '.prisma/api-journeys-modern-client'

import { builder } from '../../builder'

export const UserTeamRole = builder.enumType(PrismaUserTeamRole, {
  name: 'UserTeamRole'
})
