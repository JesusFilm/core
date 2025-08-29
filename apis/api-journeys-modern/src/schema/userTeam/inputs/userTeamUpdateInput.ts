import { builder } from '../../builder'
import { UserTeamRole } from '../enums'

export const UserTeamUpdateInput = builder.inputType('UserTeamUpdateInput', {
  fields: (t) => ({
    role: t.field({ type: UserTeamRole, required: true })
  })
})
