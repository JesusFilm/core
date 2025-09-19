import { createContext, ReactElement, ReactNode, useContext } from 'react'

import { BlockContext } from '../useJourneyAiContextGenerator'

interface JourneyAiContextValue {
  data: BlockContext[]
  isLoading: boolean
  error: string | null
}

const JourneyAiContextContext = createContext<
  JourneyAiContextValue | undefined
>(undefined)

/**
 * Consumes AI context data from the nearest JourneyAiContextProvider.
 * Use this hook in components that need Journey context, typically LLM's.
 * @returns The current Journey context data, loading state, and error state
 */
export function useJourneyAiContext(): JourneyAiContextValue {
  const context = useContext(JourneyAiContextContext)

  if (context === undefined) {
    throw new Error(
      'useJourneyAiContext must be used within a JourneyAiContextProvider. ' +
        'If you need to generate Journey context, use useJourneyAiContextGenerator instead.'
    )
  }

  return context
}

/**
 * Consumes only the AI context data from the nearest JourneyAiContextProvider.
 * Use this hook when you only need the context data and not the loading/error states.
 * @returns The current Journey context data array
 */
export function useJourneyAiContextData(): BlockContext[] {
  const { data } = useJourneyAiContext()
  return data
}

interface JourneyAiContextProviderProps {
  children: ReactNode
  data?: BlockContext[]
  isLoading?: boolean
  error?: string | null
}

export function JourneyAiContextProvider({
  children,
  data = [],
  isLoading = false,
  error = null
}: JourneyAiContextProviderProps): ReactElement {
  const contextValue: JourneyAiContextValue = {
    data,
    isLoading,
    error
  }

  return (
    <JourneyAiContextContext.Provider value={contextValue}>
      {children}
    </JourneyAiContextContext.Provider>
  )
}
