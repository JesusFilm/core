import { builder } from '../../builder'
import { IntegrationType } from '../enums/integrationType'
import { IntegrationRef } from '../integration'

import { routes } from './growthSpaces.service'

interface IntegrationGrowthSpacesRoute {
  id: string
  name: string
}

// Define the route object type using objectRef
const IntegrationGrowthSpacesRoute =
  builder.objectRef<IntegrationGrowthSpacesRoute>(
    'IntegrationGrowthSpacesRoute'
  )

IntegrationGrowthSpacesRoute.implement({
  shareable: true,
  fields: (t) => ({
    id: t.exposeString('id'),
    name: t.exposeString('name')
  })
})

export const IntegrationGrowthSpacesRef = builder.prismaObject('Integration', {
  shareable: true,
  interfaces: [IntegrationRef],
  include: { team: true },
  variant: 'IntegrationGrowthSpaces',
  fields: (t) => ({
    id: t.exposeID('id'),
    type: t.expose('type', { type: IntegrationType }),
    accessId: t.exposeString('accessId'),
    accessSecretPart: t.exposeString('accessSecretPart'),
    team: t.relation('team'),
    routes: t.field({
      type: [IntegrationGrowthSpacesRoute],
      resolve: async (integration) => {
        try {
          return await routes(integration)
        } catch (error) {
          console.error('Failed to fetch GrowthSpaces routes:', error)
          return []
        }
      }
    })
  })
})
