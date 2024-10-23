import { builder } from '../builder'

builder.prismaObject('Team', {
  fields: (t) => ({
    id: t.exposeID('id'),
    title: t.exposeString('title'),
    publicTitle: t.exposeString('publicTitle', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    userTeams: t.relation('userTeams'),
    customDomains: t.relation('customDomains'),
    integrations: t.relation('integrations')
  })
})
