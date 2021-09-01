import { noop } from 'lodash'
import { createContext } from 'react'

export const ConductorContext = createContext({
  currentBlock: {},
  goTo: noop
})

export default ConductorContext
