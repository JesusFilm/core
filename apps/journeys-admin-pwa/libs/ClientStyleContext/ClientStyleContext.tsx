import { createContext } from 'react'

interface ClientStyleContextData {
  reset: () => void
}

export const ClientStyleContext = createContext<ClientStyleContextData>({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  reset: () => {}
})
