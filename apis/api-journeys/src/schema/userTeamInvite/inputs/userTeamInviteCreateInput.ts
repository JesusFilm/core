import { builder } from '../../builder'

export const UserTeamInviteCreateInput = builder.inputType(
  'UserTeamInviteCreateInput',
  {
    fields: (t) => ({
      email: t.string({ required: true })
    })
  }
)
