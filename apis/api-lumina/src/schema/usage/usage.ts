import { builder } from '../builder'

builder.prismaObject('Usage', {
  name: 'LuminaUsage',
  fields: (t) => ({
    id: t.exposeID('id'),
    teamId: t.exposeString('teamId'),
    agentId: t.exposeString('agentId'),
    widgetId: t.expose('widgetId', { type: 'String', nullable: true }),
    websiteId: t.expose('websiteId', { type: 'String', nullable: true }),
    apiKeyId: t.expose('apiKeyId', { type: 'String', nullable: true }),
    tokens: t.exposeInt('tokens'),
    costUsd: t.expose('costUsd', { type: 'Decimal' }),
    model: t.exposeString('model'),
    provider: t.exposeString('provider'),
    requestId: t.expose('requestId', { type: 'String', nullable: true }),
    durationMs: t.expose('durationMs', { type: 'Int', nullable: true }),
    statusCode: t.expose('statusCode', { type: 'Int', nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    team: t.relation('team'),
    agent: t.relation('agent'),
    widget: t.relation('widget', { nullable: true }),
    website: t.relation('website', { nullable: true }),
    apiKey: t.relation('apiKey', { nullable: true })
  })
})
