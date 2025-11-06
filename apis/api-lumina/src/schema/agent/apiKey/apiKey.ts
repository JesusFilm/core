import { builder } from '../../builder'

builder.prismaObject('ApiKey', {
  name: 'LuminaAgentApiKey',
  fields: (t) => ({
    id: t.exposeID('id'),
    agentId: t.exposeString('agentId'),
    name: t.exposeString('name'),
    key: t.field({
      type: 'String',
      resolve: (parent) => {
        const key = parent.key
        const showFullKey = (parent as { _showFullKey?: boolean })._showFullKey
        if (showFullKey)
          return key
        
        const last4 = key.slice(-4)
        return `***${last4}`
      }
    }),
    enabled: t.exposeBoolean('enabled'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    lastUsedAt: t.expose('lastUsedAt', { type: 'DateTime', nullable: true }),
    agent: t.relation('agent')
  })
})
