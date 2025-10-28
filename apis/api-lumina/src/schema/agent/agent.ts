import { builder } from '../builder'

builder.prismaObject('Agent', {
  name: 'LuminaAgent',
  fields: (t) => ({
    id: t.exposeID('id'),
    teamId: t.exposeString('teamId'),
    name: t.exposeString('name'),
    description: t.expose('description', { type: 'String', nullable: true }),
    model: t.exposeString('model'),
    systemPrompt: t.expose('systemPrompt', { type: 'String', nullable: true }),
    temperature: t.exposeFloat('temperature'),
    maxTokens: t.expose('maxTokens', { type: 'Int', nullable: true }),
    topP: t.expose('topP', { type: 'Float', nullable: true }),
    frequencyPenalty: t.expose('frequencyPenalty', {
      type: 'Float',
      nullable: true
    }),
    presencePenalty: t.expose('presencePenalty', {
      type: 'Float',
      nullable: true
    }),
    logoUrl: t.expose('logoUrl', { type: 'String', nullable: true }),
    primaryColor: t.expose('primaryColor', { type: 'String', nullable: true }),
    secondaryColor: t.expose('secondaryColor', {
      type: 'String',
      nullable: true
    }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    team: t.relation('team'),
    tools: t.relation('tools'),
    widgets: t.relation('widgets'),
    websites: t.relation('websites'),
    apiKeys: t.relation('apiKeys'),
    usage: t.relation('usage')
  })
})
