import { SearchClient, algoliasearch } from 'algoliasearch'
import { ReactElement, ReactNode, createContext, useContext } from 'react'

let searchClientInstance: SearchClient | null = null

function getSearchClient(): SearchClient {
  if (searchClientInstance === null) {
    searchClientInstance = algoliasearch(
      process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? '',
      process.env.ALGOLIA_SERVER_API_KEY ??
        process.env.NEXT_PUBLIC_ALGOLIA_API_KEY ??
        ''
    )
  }
  return searchClientInstance
}

const InstantSearchContext = createContext<SearchClient | null>(null)

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
  if (context === null) {
    throw new Error(
      'useInstantSearch must be used within a InstantSearchProvider'
    )
  }
  return context
}
