import { builder } from '../builder'

// Reference User from api-users federation
const UserRef = builder.externalRef(
  'User',
  builder.selection<{ id: string }>('id')
)

builder.prismaObject('TeamMember', {
  name: 'LuminaTeamMember',
  fields: (t) => ({
    id: t.exposeID('id'),
    userId: t.exposeString('userId'),
    role: t.field({
      type: 'Role',
      resolve: (member) => member.role
    }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    team: t.relation('team'),
    user: t.field({
      type: UserRef,
      resolve: (member) => ({ id: member.userId })
    })
  })
})
