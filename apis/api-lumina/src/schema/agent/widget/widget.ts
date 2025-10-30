import { builder } from '../../builder'

builder.prismaObject('Widget', {
  name: 'LuminaAgentWidget',
  fields: (t) => ({
    id: t.exposeID('id'),
    agentId: t.exposeString('agentId'),
    name: t.exposeString('name'),
    enabled: t.exposeBoolean('enabled'),
    position: t.exposeString('position', { nullable: true }),
    theme: t.exposeString('theme', { nullable: true }),
    buttonText: t.exposeString('buttonText', { nullable: true }),
    buttonIcon: t.exposeString('buttonIcon', { nullable: true }),
    primaryColor: t.exposeString('primaryColor', { nullable: true }),
    allowedDomains: t.stringList({
      resolve: (widget) => widget.allowedDomains
    }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    agent: t.relation('agent'),
    usage: t.relation('usage')
  })
})
