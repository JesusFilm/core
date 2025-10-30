import { builder } from '../builder'

builder.prismaObject('Agent', {
  name: 'LuminaAgent',
  fields: (t) => ({
    id: t.exposeID('id'),
    teamId: t.exposeString('teamId'),
    name: t.exposeString('name'),
    description: t.exposeString('description', { nullable: true }),
    model: t.exposeString('model'),
    systemPrompt: t.exposeString('systemPrompt', { nullable: true }),
    temperature: t.exposeFloat('temperature'),
    maxTokens: t.exposeInt('maxTokens', { nullable: true }),
    topP: t.exposeFloat('topP', { nullable: true }),
    frequencyPenalty: t.exposeFloat('frequencyPenalty', { nullable: true }),
    presencePenalty: t.exposeFloat('presencePenalty', { nullable: true }),
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
