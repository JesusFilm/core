import { ReactElement, ReactNode, createContext, useContext } from 'react'

import { JourneyFieldsFragment as Journey } from './__generated__/journeyFields'

interface Context {
  journey?: Journey
  variant?: 'default' | 'admin' | 'embed'
}

const JourneyContext = createContext<Context>({
  variant: 'default'
})

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
    <JourneyContext.Provider value={{ variant: 'default', ...value }}>
      {children}
    </JourneyContext.Provider>
  )
}
