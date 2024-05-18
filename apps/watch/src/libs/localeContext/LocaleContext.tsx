'use client'

import { ReactElement, ReactNode, createContext, useContext } from 'react'

interface Context {
  locale: string
}

const LocaleContext = createContext<Context | undefined>(undefined)

export function useLocale(): Context {
  const context = useContext(LocaleContext)

  if (context === undefined) {
    throw new Error('useLocales must be used within a LocaleProvider')
  }

  return context
}

interface LocaleProviderProps {
  children: ReactNode
  locale: string
}

export function LocaleProvider({
  children,
  locale
}: LocaleProviderProps): ReactElement {
  return (
    <LocaleContext.Provider value={{ locale }}>
      {children}
    </LocaleContext.Provider>
  )
}
