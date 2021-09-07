import { createApplication } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import journey from '../journey'
import block from '../block'

export default createApplication({
  modules: [journey, block],
  schemaBuilder
})
