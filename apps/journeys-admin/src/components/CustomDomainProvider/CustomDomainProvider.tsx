import { ReactElement, ReactNode, createContext, useContext } from 'react'

import { GetCustomDomain } from '../../../__generated__/GetCustomDomain'

interface Context {
  customDomains?: GetCustomDomain
}

const CustomDomainContext = createContext<Context>({})

export const useCustomDomain = (): Context => useContext(CustomDomainContext)

interface CustomDomainProviderProps {
  children: ReactNode
  value?: Partial<Context>
}

export function CustomDomainProvider({
  children,
  value
}: CustomDomainProviderProps): ReactElement {
  return (
    <CustomDomainContext.Provider value={{ ...value }}>
      {children}
    </CustomDomainContext.Provider>
  )
}
