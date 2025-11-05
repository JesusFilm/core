import { SearchClient, algoliasearch } from 'algoliasearch'
import { ReactElement, ReactNode, createContext, useContext } from 'react'

const fallbackAppId = 'watch-local-app'
const fallbackApiKey = 'watch-local-key'

const resolvedAppId =
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ??
  (process.env.NODE_ENV === 'production' ? '' : fallbackAppId)

const resolvedApiKey =
  process.env.ALGOLIA_SERVER_API_KEY ??
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY ??
  (process.env.NODE_ENV === 'production' ? '' : fallbackApiKey)

if (
  process.env.NODE_ENV === 'production' &&
  (resolvedAppId === '' || resolvedApiKey === '')
) {
  throw new Error('Missing Algolia credentials for InstantSearch')
}

const searchClient = algoliasearch(
  resolvedAppId === '' ? fallbackAppId : resolvedAppId,
  resolvedApiKey === '' ? fallbackApiKey : resolvedApiKey
)

const InstantSearchContext = createContext<SearchClient>(searchClient)

interface InstantSearchProviderProps {
  children: ReactNode
  initialState?: SearchClient
}

export function InstantSearchProvider({
  children
}: InstantSearchProviderProps): ReactElement {
  return (
    <InstantSearchContext.Provider value={searchClient}>
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
