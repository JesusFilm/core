import { createApplication } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import { blockModule } from '../block'
import { journeyModule } from '../journey'
import { responseModule } from '../response'

export default createApplication({
  modules: [blockModule, journeyModule, responseModule],
  schemaBuilder
})
