import { createApplication } from 'graphql-modules'
import { buildModuleSubgraphSchema } from './buildModuleSubgraphSchema'
import journey from '../journey'

export default createApplication({
  modules: [journey],
  schemaBuilder: buildModuleSubgraphSchema
})
