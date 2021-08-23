import { createApplication } from 'graphql-modules'
import { buildModuleSubgraphSchema } from '../../lib/shared/util-graphql/buildModuleSubgraphSchema'
import journey from '../journey'

export default createApplication({
  modules: [journey],
  schemaBuilder: buildModuleSubgraphSchema
})
