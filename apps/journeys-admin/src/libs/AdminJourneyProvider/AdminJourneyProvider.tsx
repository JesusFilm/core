import { ReactElement, ReactNode, createContext, useContext } from 'react'

import { AdminJourneyFields as AdminJourney } from '../../../__generated__/AdminJourneyFields'

interface Context {
  journey?: AdminJourney
}

const JourneyContext = createContext<Context>({})

export function useAdminJourney(): Context {
  return useContext(JourneyContext)
}

interface JourneyProviderProps {
  children: ReactNode
  value?: Partial<Context>
}

export function AdminJourneyProvider({
  value,
  children
}: JourneyProviderProps): ReactElement {
  return (
    <JourneyContext.Provider value={{ ...value }}>
      {children}
    </JourneyContext.Provider>
  )
}
