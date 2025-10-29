import { builder } from '../../builder'

builder.prismaObject('ApiKey', {
  name: 'LuminaAgentApiKey',
  fields: (t) => ({
    id: t.exposeID('id'),
    agentId: t.exposeString('agentId'),
    name: t.exposeString('name'),
    keyHash: t.exposeString('keyHash'),
    enabled: t.exposeBoolean('enabled'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    lastUsed: t.expose('lastUsed', { type: 'DateTime', nullable: true }),
    agent: t.relation('agent'),
    usage: t.relation('usage')
  })
})
