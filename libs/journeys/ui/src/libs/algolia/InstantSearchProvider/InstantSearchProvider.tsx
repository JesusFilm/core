import { SearchClient, algoliasearch } from 'algoliasearch'
import { ReactElement, ReactNode, createContext, useContext } from 'react'

// let searchClientInstance: SearchClient | null = null

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? '',
  process.env.ALGOLIA_SERVER_API_KEY ??
    process.env.NEXT_PUBLIC_ALGOLIA_API_KEY ??
    ''
)

function getSearchClient(): SearchClient {
  if (searchClient === null) {
    return algoliasearch(
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
  const searchClient = getSearchClient()
  return (
    <InstantSearchContext.Provider value={searchClient}>
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
