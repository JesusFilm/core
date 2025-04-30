import { SearchClient, algoliasearch } from 'algoliasearch'
import { ReactElement, ReactNode, createContext, useContext } from 'react'

let searchClient: SearchClient | null = null

function getSearchClient(): SearchClient {
  if (searchClient === null) {
    searchClient = algoliasearch(
      process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? '',
      process.env.ALGOLIA_SERVER_API_KEY ??
        process.env.NEXT_PUBLIC_ALGOLIA_API_KEY ??
        ''
    )
  }
  return searchClient
}

const InstantSearchContext = createContext<SearchClient>(getSearchClient())

interface InstantSearchProviderProps {
  children: ReactNode
  initialState?: SearchClient
}

export function InstantSearchProvider({
  children
}: InstantSearchProviderProps): ReactElement {
  return (
    <InstantSearchContext.Provider value={getSearchClient()}>
      {children}
    </InstantSearchContext.Provider>
  )
}

export function useInstantSearchClient(): SearchClient {
  const context = useContext(InstantSearchContext)
  if (context === undefined) {
    throw new Error(
      'useInstantSearch must be used within a InstantSearchProvider'
    )
  }
  return context
}
