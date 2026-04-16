import { ReactElement, ReactNode, createContext, useContext } from 'react'

import { FullBlockContext } from '../useJourneyAiContextGenerator/utils/createFullContext'

interface JourneyAiContextValue {
  aiContextData: FullBlockContext[]
  isLoading: boolean
  error: Error | null
}

const JourneyAiContext = createContext<JourneyAiContextValue>({
  aiContextData: [],
  isLoading: false,
  error: null
})

interface JourneyAiContextProviderProps {
  value: JourneyAiContextValue
  children: ReactNode
}

export function JourneyAiContextProvider({
  value,
  children
}: JourneyAiContextProviderProps): ReactElement {
  return (
    <JourneyAiContext.Provider value={value}>
      {children}
    </JourneyAiContext.Provider>
  )
}

export function useJourneyAiContext(): JourneyAiContextValue {
  return useContext(JourneyAiContext)
}
