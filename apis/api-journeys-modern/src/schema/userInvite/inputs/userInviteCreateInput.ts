import { builder } from '../../builder'

export const UserInviteCreateInput = builder.inputType(
  'UserInviteCreateInput',
  {
    fields: (t) => ({
      email: t.string({ required: true })
    })
  }
)
