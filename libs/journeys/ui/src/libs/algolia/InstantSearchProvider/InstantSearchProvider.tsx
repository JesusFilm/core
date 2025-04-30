import { SearchClient, algoliasearch } from 'algoliasearch'
import {
  ReactElement,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState
} from 'react'

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

// Initialize with null during SSR
const InstantSearchContext = createContext<SearchClient | null>(null)

interface InstantSearchProviderProps {
  children: ReactNode
  initialState?: SearchClient
}

export function InstantSearchProvider({
  children
}: InstantSearchProviderProps): ReactElement {
  const [client, setClient] = useState<SearchClient | null>(null)

  useEffect(() => {
    // Only initialize the client on the client side
    setClient(getSearchClient())
  }, [])

  // During SSR, client will be null, but that's fine because
  // InstantSearch components don't run during SSR anyway
  return (
    <InstantSearchContext.Provider value={client}>
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
