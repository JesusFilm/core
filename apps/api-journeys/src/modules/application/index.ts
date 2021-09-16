import { createApplication } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import journey from '../journey'
import block from '../block'
import blockResponse from '../blockResponse'
import userSession from '../userSession'

export default createApplication({
  modules: [journey, block, blockResponse, userSession],
  schemaBuilder
})
