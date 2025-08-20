import { builder } from '../builder'

import { IntegrationType as IntegrationTypeEnum } from './enums'

export const IntegrationRef = builder.prismaInterface('Integration', {
  fields: (t) => ({
    id: t.exposeID('id'),
    type: t.expose('type', { type: IntegrationTypeEnum }),
    team: t.relation('team')
  })
})

// IntegrationGrowthSpaces implementation using Prisma object
