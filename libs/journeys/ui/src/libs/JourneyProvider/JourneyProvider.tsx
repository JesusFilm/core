import { createContext, ReactElement, ReactNode, useContext } from 'react'
import { JourneyFields as Journey } from './__generated__/JourneyFields'

export enum RenderLocation {
  Admin,
  Journey,
  Embed
}

interface Context {
  journey?: Journey
  renderLocation: RenderLocation
}

const JourneyContext = createContext<Context>({
  renderLocation: RenderLocation.Journey
})

export function useJourney(): Context {
  const context = useContext(JourneyContext)

  return context
}

interface JourneyProviderProps {
  children: ReactNode
  value: Context
}

export function JourneyProvider({
  value,
  children
}: JourneyProviderProps): ReactElement {
  return (
    <JourneyContext.Provider value={{ ...value }}>
      {children}
    </JourneyContext.Provider>
  )
}
