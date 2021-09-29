import { createApplication } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import block from '../block'
import journey from '../journey'
import response from '../response'

export default createApplication({
  modules: [block, journey, response],
  schemaBuilder
})
