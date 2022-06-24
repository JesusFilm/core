import { createContext, ReactElement, ReactNode, useContext } from 'react'

interface JourneyList {
  ids: string[]
}

const JourneyListContext = createContext(
  {} as unknown as JourneyList | undefined
)

export function useJourneyList(): JourneyList | undefined {
  return useContext(createContext({ ids: [] }))
}

interface LanguageProviderProps {
  children: ReactNode
  value?: JourneyList
}

export function JourneyListProvider({
  children,
  value
}: LanguageProviderProps): ReactElement {
  return (
    <JourneyListContext.Provider value={value}>
      {children}
    </JourneyListContext.Provider>
  )
}
