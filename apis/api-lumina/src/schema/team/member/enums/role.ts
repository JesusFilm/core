import { Role as PrismaRole } from '@core/prisma/lumina/client'

import { builder } from '../../../builder'

export const Role = builder.enumType(PrismaRole, {
  name: 'LuminaTeamMemberRole'
})
