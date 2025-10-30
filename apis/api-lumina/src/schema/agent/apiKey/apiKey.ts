import { builder } from '../../builder'

builder.prismaObject('ApiKey', {
  name: 'LuminaAgentApiKey',
  fields: (t) => ({
    id: t.exposeID('id'),
    agentId: t.exposeString('agentId'),
    name: t.exposeString('name'),
    key: t.exposeString('key'),
    enabled: t.exposeBoolean('enabled'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    lastUsedAt: t.expose('lastUsedAt', { type: 'DateTime', nullable: true }),
    agent: t.relation('agent')
  })
})
