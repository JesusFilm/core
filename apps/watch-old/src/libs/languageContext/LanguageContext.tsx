import { useRouter } from 'next/router'
import { ReactElement, ReactNode, createContext, useContext } from 'react'

import { languages } from './baseLanguages'

interface LanguageName {
  value: string
  primary: boolean
}

interface Language {
  id: string
  name: LanguageName[]
  bcp47: string | null
}

const LanguageContext = createContext({} as unknown as Language | undefined)

export function useLanguage(): Language | undefined {
  const router = useRouter()
  const language =
    languages.find(
      (l) => l.bcp47 === router?.locale ?? router?.defaultLocale
    ) ?? languages[0]
  const context = useContext(createContext(language))
  return context
}

interface LanguageProviderProps {
  children: ReactNode
  value?: Language
}

export function LanguageProvider({
  children,
  value
}: LanguageProviderProps): ReactElement {
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}
