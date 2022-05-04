import { gql, useQuery } from '@apollo/client'
import { useRouter } from 'next/router'
import { createContext, ReactElement, ReactNode, useContext } from 'react'
import { GetCurrentLanguge_language as Language } from '../../../__generated__/GetCurrentLanguge'

const LanguageContext = createContext({} as unknown as Language | undefined)

const GET_CURRENT_LANGUAGE = gql`
  query GetCurrentLanguge($id: ID!) {
    language(id: $id, idType: bcp47) {
      id
      name {
        value
        primary
      }
      bcp47
      iso3
    }
  }
`
export function useLanguage(): Language | undefined {
  const router = useRouter()
  const { data } = useQuery(GET_CURRENT_LANGUAGE, {
    variables: {
      id: router.locale ?? router.defaultLocale
    }
  })
  const context = useContext(LanguageContext)

  return context
}

interface LanguageProviderProps {
  children: ReactNode
  value?: Language
}

export function LanguageProvider({
  children
}: LanguageProviderProps): ReactElement {
  return <LanguageContext.Provider>{children}</LanguageContext.Provider>
}
