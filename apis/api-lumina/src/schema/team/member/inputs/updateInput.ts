import { builder } from '../../../builder'
import { Role } from '../../enums/role'

export const TeamMemberUpdateInput = builder.inputType(
  'LuminaTeamMemberUpdateInput',
  {
    fields: (t) => ({
      role: t.field({ type: Role, required: true })
    })
  }
)
