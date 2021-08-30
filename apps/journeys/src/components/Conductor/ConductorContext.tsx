import { createContext } from 'react'

export const ConductorContext = createContext({
  currentBlock: {},
  goTo: (id?: string) => {}
})

export default ConductorContext
