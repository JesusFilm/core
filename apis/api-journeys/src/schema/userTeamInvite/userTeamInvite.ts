import { builder } from '../builder'

export const UserTeamInviteRef = builder.prismaObject('UserTeamInvite', {
  shareable: true,
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    teamId: t.exposeID('teamId', { nullable: false }),
    email: t.exposeString('email', { nullable: false })
  })
})
