import { SearchClient, algoliasearch } from 'algoliasearch'
import { ReactElement, ReactNode, createContext, useContext } from 'react'

function getSearchClient(): SearchClient {
  if (typeof window === 'undefined') {
    throw new Error('SearchClient should not be used on the server')
  }
  return algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? '',
    process.env.ALGOLIA_SERVER_API_KEY ??
      process.env.NEXT_PUBLIC_ALGOLIA_API_KEY ??
      ''
  )
}

const InstantSearchContext = createContext<SearchClient>(getSearchClient())

interface InstantSearchProviderProps {
  children: ReactNode
  initialState?: SearchClient
}

export function InstantSearchProvider({
  children
}: InstantSearchProviderProps): ReactElement {
  const searchClient = getSearchClient()
  return (
    <InstantSearchContext.Provider value={searchClient}>
      {children}
    </InstantSearchContext.Provider>
  )
}

export function useInstantSearchClient(): SearchClient {
  const context = useContext(InstantSearchContext)
  if (!context) {
    throw new Error(
      'useInstantSearchClient must be used within a InstantSearchProvider.'
    )
  }
  return context
}
