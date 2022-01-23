import { createContext, ReactElement, ReactNode, useContext } from 'react'
import { GetJourneyForEdit_journey } from '../../../__generated__/GetJourneyForEdit'
import { GetJourney_journey } from '../../../__generated__/GetJourney'

// Must set initial context for useContext, but it will always be a journey
// Else JourneyView page will not load
const JourneyContext = createContext({})

export function useJourney<T>(): T {
  const context = useContext(JourneyContext)
  if (context === undefined) {
    throw new Error('useJourney must be used within a JourneyProvider')
  }
  return context as T
}

interface JourneyProviderProps {
  children: ReactNode
  value: GetJourney_journey | GetJourneyForEdit_journey
}

export function JourneyProvider({
  value,
  children
}: JourneyProviderProps): ReactElement {
  return (
    <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>
  )
}
