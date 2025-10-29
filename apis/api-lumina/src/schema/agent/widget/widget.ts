import { builder } from '../../builder'

builder.prismaObject('Widget', {
  name: 'LuminaAgentWidget',
  fields: (t) => ({
    id: t.exposeID('id'),
    agentId: t.exposeString('agentId'),
    name: t.exposeString('name'),
    enabled: t.exposeBoolean('enabled'),
    position: t.exposeString('position'),
    theme: t.exposeString('theme'),
    triggerText: t.exposeString('triggerText'),
    primaryColor: t.expose('primaryColor', { type: 'String', nullable: true }),
    allowedDomains: t.expose('allowedDomains', {
      type: 'String',
      nullable: true
    }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    agent: t.relation('agent'),
    usage: t.relation('usage')
  })
})
