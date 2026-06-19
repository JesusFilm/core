import { builder } from '../../builder'
import { UserTeamRole } from '../enums'

export const UserTeamFilterInput = builder.inputType('UserTeamFilterInput', {
  fields: (t) => ({
    role: t.field({ type: [UserTeamRole], required: false })
  })
})
