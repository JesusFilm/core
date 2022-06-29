import { ReactElement, ReactNode, createContext, useContext } from 'react'

const FlagsContext = createContext<{ [key: string]: boolean } | undefined>(
  undefined
)

interface FlagsProviderProps {
  flags?: { [key: string]: boolean }
  children: ReactNode
}

export const FlagsProvider = ({
  flags = {},
  children
}: FlagsProviderProps): ReactElement => {
  return (
    <FlagsContext.Provider value={{ ...flags }}>
      {children}
    </FlagsContext.Provider>
  )
}

export function useFlags(): { [key: string]: boolean } {
  const context = useContext(FlagsContext)

  if (context === undefined) {
    throw new Error('useFlags must be used within a FlagsProvider')
  }
  return context
}
