import { gql } from '@apollo/client'
import { useRouter } from 'next/router'
import { createContext, ReactElement, ReactNode, useContext } from 'react'
import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'

const LanguageContext = createContext({} as unknown as Language | undefined)

const GET_CURRENT_LANGUAGE = gql`
  query GetCurrentLanguge($id: )
`
export function useLanguage(): Language | undefined {
  const router = useRouter()

  const context = useContext(LanguageContext)

  return context
}

interface LanguageProviderProps {
  children: ReactNode
  value?: Language
}

export function LanguageProvider({
  value,
  children
}: LanguageProviderProps): ReactElement {
  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}
