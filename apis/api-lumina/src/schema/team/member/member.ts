import { builder } from '../../builder'
import { UserRef } from '../../user'

import { Role } from './enums/role'

builder.prismaObject('TeamMember', {
  name: 'LuminaTeamMember',
  fields: (t) => ({
    id: t.exposeID('id'),
    userId: t.exposeString('userId'),
    role: t.expose('role', { type: Role }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    team: t.relation('team'),
    user: t.field({
      type: UserRef,
      resolve: (member) => ({ id: member.userId })
    })
  })
})
