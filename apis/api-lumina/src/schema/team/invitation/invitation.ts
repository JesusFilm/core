import { builder } from '../../builder'
import { Role } from '../enums/role'

builder.prismaObject('TeamInvitation', {
  name: 'LuminaTeamInvitation',
  fields: (t) => ({
    id: t.exposeID('id'),
    email: t.exposeString('email'),
    role: t.expose('role', { type: Role }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    team: t.relation('team')
  })
})
