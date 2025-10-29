import { builder } from '../../builder'

builder.prismaObject('Website', {
  name: 'LuminaAgentWebsite',
  fields: (t) => ({
    id: t.exposeID('id'),
    agentId: t.exposeString('agentId'),
    name: t.exposeString('name'),
    enabled: t.exposeBoolean('enabled'),
    subdomain: t.expose('subdomain', { type: 'String', nullable: true }),
    customDomain: t.expose('customDomain', { type: 'String', nullable: true }),
    metaTitle: t.expose('metaTitle', { type: 'String', nullable: true }),
    metaDescription: t.expose('metaDescription', {
      type: 'String',
      nullable: true
    }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    agent: t.relation('agent'),
    usage: t.relation('usage')
  })
})
