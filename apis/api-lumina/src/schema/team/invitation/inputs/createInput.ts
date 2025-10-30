import { z } from 'zod'

import { Role as PrismaRole } from '@core/prisma/lumina/client'

import { builder } from '../../../builder'
import { Role } from '../../enums/role'

const schema = z.object({
  teamId: z.string().uuid('Team ID must be a valid UUID'),
  email: z.string().email(),
  role: z.nativeEnum(PrismaRole)
})

export const TeamInvitationCreateInput = builder.inputType(
  'LuminaTeamInvitationCreateInput',
  {
    fields: (t) => ({
      teamId: t.id({ required: true }),
      email: t.string({ required: true }),
      role: t.field({ type: Role, required: true })
    }),
    validate: {
      schema
    }
  }
)
