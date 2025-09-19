import { builder } from '../../../builder'

export interface IntegrationGrowthSpacesRoute {
  id: string
  name: string
}

export const IntegrationGrowthSpacesRouteRef = builder
  .objectRef<IntegrationGrowthSpacesRoute>('IntegrationGrowthSpacesRoute')
  .implement({
    shareable: true,
    fields: (t) => ({
      id: t.exposeString('id'),
      name: t.exposeString('name')
    })
  })
