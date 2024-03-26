import { ReactElement, ReactNode, createContext, useContext } from 'react'

import { GetCustomDomains } from '../../../__generated__/GetCustomDomains'

interface Context {
  customDomains?: GetCustomDomains
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
