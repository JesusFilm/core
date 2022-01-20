import { createContext, ReactElement, ReactNode, useContext } from 'react'
import { GetJourney_adminJourney as Journey } from '../../../../__generated__/GetJourney'

// Must set initial context for useContext, but it will always be a journey
// Else JourneyView page will not load
const JourneyContext = createContext<Journey | undefined>(undefined)

export function useJourney(): Journey {
  const context = useContext(JourneyContext)
  if (context === undefined) {
    throw new Error('useJourney must be used within a JourneyProvider')
  }
  return context
}

interface JourneyProviderProps {
  children: ReactNode
  value: Journey
}

export function JourneyProvider({
  value,
  children
}: JourneyProviderProps): ReactElement {
  return (
    <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>
  )
}
