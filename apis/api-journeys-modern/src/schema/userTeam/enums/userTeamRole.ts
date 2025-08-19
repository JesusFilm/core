import { UserTeamRole as PrismaUserTeamRole } from '@core/prisma/journeys/client'

import { builder } from '../../builder'

export const UserTeamRole = builder.enumType(PrismaUserTeamRole, {
  name: 'UserTeamRole'
})
