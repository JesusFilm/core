import { createApplication } from 'graphql-modules'
import journey from '../journey'
import block from '../block'

export default createApplication({
  modules: [journey, block]
})
