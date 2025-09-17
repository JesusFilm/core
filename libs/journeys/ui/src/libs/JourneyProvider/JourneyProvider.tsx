import { ReactElement, ReactNode, createContext, useContext } from 'react'

import { JourneyFields as Journey } from './__generated__/JourneyFields'

export interface JourneyProviderContext {
  journey?: Journey
  variant?: 'default' | 'admin' | 'embed' | 'customize'
}

const JourneyContext = createContext<JourneyProviderContext>({
  variant: 'default'
})

export function useJourney(): JourneyProviderContext {
  const context = useContext(JourneyContext)

  return context
}

interface JourneyProviderProps {
  children: ReactNode
  value?: Partial<JourneyProviderContext>
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
