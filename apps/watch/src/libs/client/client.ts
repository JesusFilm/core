import {
  ApolloClient,
  createHttpLink,
  NormalizedCacheObject
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { useMemo } from 'react'
import { cache } from './cache'

let apolloClient: ApolloClient<NormalizedCacheObject> | null = null

export function createApolloClient(
  token?: string,
  initialState?: NormalizedCacheObject
): ApolloClient<NormalizedCacheObject> {
  if (apolloClient === null) {
    const httpLink = createHttpLink({
      uri: process.env.NEXT_PUBLIC_GATEWAY_URL
    })

    const authLink = setContext((_, { headers }) => {
      return {
        headers: {
          ...headers,
          Authorization: token ?? ''
        }
      }
    })

    apolloClient = new ApolloClient({
      ssrMode: typeof window === 'undefined',
      link: authLink.concat(httpLink),
      cache: cache.restore(initialState ?? {})
    })
  }
  return apolloClient
}

export const useApolloClient = (
  token?: string,
  initialState?: NormalizedCacheObject
): ApolloClient<NormalizedCacheObject> => {
  const store: ApolloClient<NormalizedCacheObject> = useMemo(
    () => createApolloClient(token, initialState),
    [token, initialState]
  )
  return store
}

const client = new ApolloClient({
  ssrMode: typeof window === 'undefined',
  uri: process.env.NEXT_PUBLIC_GATEWAY_URL,
  cache
})

export default client
