import { builder } from '../builder'

builder.prismaObject('Team', {
  name: 'LuminaTeam',
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    members: t.relation('members'),
    agents: t.relation('agents'),
    plan: t.relation('plan'),
    usage: t.relation('usage')
  })
})
