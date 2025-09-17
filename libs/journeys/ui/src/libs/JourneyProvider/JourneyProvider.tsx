import { ReactElement, ReactNode, createContext, useContext } from 'react'
import { JourneyFields as Journey } from './__generated__/JourneyFields'

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
