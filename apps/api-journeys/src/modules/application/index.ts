import { createApplication } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import { blockModule, journeyModule, responseModule } from '..'

export default createApplication({
  modules: [blockModule, journeyModule, responseModule],
  schemaBuilder
})
