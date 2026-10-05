import { builder } from '../builder'

import { IntegrationType as IntegrationTypeEnum } from './enums'

export const IntegrationRef = builder.prismaInterface('Integration', {
  resolveType: (integration) => {
    switch (integration.type) {
      case 'google':
        return 'IntegrationGoogle'
      case 'growthSpaces':
        return 'IntegrationGrowthSpaces'
      default:
        return null
    }
  },
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    type: t.expose('type', { type: IntegrationTypeEnum, nullable: false }),
    team: t.relation('team', { nullable: false })
  })
})
