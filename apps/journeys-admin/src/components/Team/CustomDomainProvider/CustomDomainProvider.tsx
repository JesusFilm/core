import { ReactElement, createContext, useContext, useState } from 'react'

interface CustomDomainContextProps {
  customDomain: string | undefined
  setCustomDomain: (string) => void
}

export const CustomDomainContext = createContext<CustomDomainContextProps>(
  {} as unknown as CustomDomainContextProps
)

export const useCustomDomain = (): CustomDomainContextProps =>
  useContext(CustomDomainContext)

export const CustomDomainProvider = ({ children }): ReactElement => {
  // TODO: state changes replaced with network calls
  const [customDomain, setCustomDomain] = useState<string | undefined>()

  return (
    <CustomDomainContext.Provider value={{ customDomain, setCustomDomain }}>
      {children}
    </CustomDomainContext.Provider>
  )
}
