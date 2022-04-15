import {
  ApolloClient,
  createHttpLink,
  NormalizedCacheObject
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { useMemo } from 'react'
import { cache } from './cache'

function createApolloClient(
  token: string
): ApolloClient<NormalizedCacheObject> {
  const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_GATEWAY_URL
  })

  const authLink = setContext(async (_, { headers }) => {
    return {
      headers: {
        ...headers,
        Authorization: token
      }
    }
  })

  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: authLink.concat(httpLink),
    cache: cache()
  })
}

export function useApollo(token: string): ApolloClient<NormalizedCacheObject> {
  return useMemo(() => createApolloClient(token), [token])
}
