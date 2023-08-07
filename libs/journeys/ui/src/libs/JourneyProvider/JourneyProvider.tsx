import { ReactElement, ReactNode, createContext, useContext } from 'react'

import { JourneyFields as Journey } from './__generated__/JourneyFields'

interface Context {
  journey?: Journey
  admin: boolean
}

const JourneyContext = createContext<Context>({ admin: false })

export function useJourney(): Context {
  const context = useContext(JourneyContext)

  return context
}

interface JourneyProviderProps {
  children: ReactNode
  value?: Partial<Context>
}

export function JourneyProvider({
  value,
  children
}: JourneyProviderProps): ReactElement {
  return (
    <JourneyContext.Provider value={{ admin: false, ...value }}>
      {children}
    </JourneyContext.Provider>
  )
}
