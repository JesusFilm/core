import { builder } from '../builder'

builder.prismaObject('AgentTool', {
  name: 'LuminaAgentTool',
  fields: (t) => ({
    id: t.exposeID('id'),
    agentId: t.exposeString('agentId'),
    type: t.exposeString('type'),
    name: t.exposeString('name'),
    description: t.expose('description', { type: 'String', nullable: true }),
    parameters: t.exposeString('parameters'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    agent: t.relation('agent')
  })
})
