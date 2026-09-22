import { ReactElement, ReactNode, createContext, useContext } from 'react'

import { JourneyFields as Journey } from './__generated__/JourneyFields'

export interface JourneyProviderContext {
  journey?: Journey
  renderMode?: 'default' | 'admin' | 'embed' | 'customize'
}

const JourneyContext = createContext<JourneyProviderContext>({
  renderMode: 'default'
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
    <JourneyContext.Provider value={{ renderMode: 'default', ...value }}>
      {children}
    </JourneyContext.Provider>
  )
}
