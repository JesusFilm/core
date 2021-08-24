import { createApplication } from 'graphql-modules'
import { buildModuleSubgraphSchema } from '@core/shared/util-graphql'
import journey from '../journey'

export default createApplication({
  modules: [journey],
  schemaBuilder: buildModuleSubgraphSchema
})
