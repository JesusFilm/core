import { createContext, ReactElement, ReactNode, useContext } from 'react'
import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'

// Must set initial context for useContext, but it will always be a journey
// Else JourneyView page will not load
// { id: string } type is for testing
const JourneyContext = createContext<Journey | undefined | { id: string }>(
  undefined
)

export function useJourney(): Journey | { id: string } {
  const context = useContext(JourneyContext)
  if (context === undefined) {
    throw new Error('useJourney must be used within a JourneyProvider')
  }
  return context
}

interface JourneyProviderProps {
  children: ReactNode
  value: Journey | { id: string }
}

export function JourneyProvider({
  value,
  children
}: JourneyProviderProps): ReactElement {
  return (
    <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>
  )
}
