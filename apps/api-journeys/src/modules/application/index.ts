import { createApplication } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import journey from '../journey'

export default createApplication({
  modules: [journey],
  schemaBuilder
})
