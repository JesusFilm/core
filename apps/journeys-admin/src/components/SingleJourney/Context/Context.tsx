import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { createContext, ReactElement, ReactNode } from 'react'
import { defaultJourney } from '../singleJourneyData'

export const JourneyContext = createContext<Journey>(defaultJourney)

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
