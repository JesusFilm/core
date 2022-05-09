import { createContext, ReactElement, ReactNode, useContext } from 'react'
import { JourneyFields as Journey } from './__generated__/JourneyFields'

// Must set initial context for useContext, but it will always be a journey
// Else JourneyView page will not load
const JourneyContext = createContext({} as unknown as Journey | undefined)

export function useJourney(): Journey | undefined {
  const context = useContext(JourneyContext)

  return context
}

interface JourneyProviderProps {
  children: ReactNode
  value?: Journey
}

export function JourneyProvider({
  value,
  children
}: JourneyProviderProps): ReactElement {
  return (
    <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>
  )
}
