import { builder } from '../builder'

builder.prismaObject('Team', {
  name: 'LuminaTeam',
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    slug: t.exposeString('slug'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    members: t.relation('members'),
    agents: t.relation('agents'),
    billingSubscription: t.relation('billingSubscription', { nullable: true }),
    usage: t.relation('usage')
  })
})
