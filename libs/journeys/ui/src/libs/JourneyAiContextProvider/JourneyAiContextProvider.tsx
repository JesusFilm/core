import { createContext, ReactElement, ReactNode, useContext } from 'react'

import { BlockContext } from '../useJourneyAiContextGenerator'

const JourneyAiContextContext = createContext<BlockContext[] | undefined>(
  undefined
)

/**
 * Consumes AI context data from the nearest JourneyAiContextProvider.
 * Use this hook in components that need Journey context, typically LLM's.
 * @returns The current Journey context data
 */
export function useJourneyAiContext(): BlockContext[] {
  const context = useContext(JourneyAiContextContext)

  if (context === undefined) {
    throw new Error(
      'useJourneyAiContext must be used within a JourneyAiContextProvider. ' +
        'If you need to generate Journey context, use useJourneyAiContextGenerator instead.'
    )
  }

  return context
}

interface JourneyAiContextProviderProps {
  children: ReactNode
  value?: BlockContext[]
}

export function JourneyAiContextProvider({
  children,
  value = []
}: JourneyAiContextProviderProps): ReactElement {
  return (
    <JourneyAiContextContext.Provider value={value}>
      {children}
    </JourneyAiContextContext.Provider>
  )
}
