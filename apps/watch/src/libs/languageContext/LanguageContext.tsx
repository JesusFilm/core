import { useRouter } from 'next/router'
import { createContext, ReactElement, ReactNode, useContext } from 'react'
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
  const language = findLanguage(router?.locale, router?.defaultLocale)
  const context = useContext(createContext(language))
  return context
}

export function findLanguage(
  locale?: string,
  defaultLocale?: string
): Language {
  const language =
    languages.find((l) => l.bcp47 === locale ?? defaultLocale) ?? languages[0]
  return language
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
