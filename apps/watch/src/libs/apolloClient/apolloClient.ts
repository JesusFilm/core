import {
  ApolloClient,
  createHttpLink,
  NormalizedCacheObject,
  from
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { useMemo } from 'react'
import { RetryLink } from '@apollo/client/link/retry'
import fetch from 'cross-fetch'
import { cache } from './cache'

interface CreateApolloClientParams {
  token?: string
  initialState?: NormalizedCacheObject
}

export function createApolloClient({
  token,
  initialState
}: CreateApolloClientParams = {}): ApolloClient<NormalizedCacheObject> {
  const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_GATEWAY_URL,
    fetch
  })

  const authLink = setContext(async (_, { headers }) => {
    return {
      headers: {
        ...headers,
        Authorization: token
      }
    }
  })

  const retryLink = new RetryLink({
    delay: {
      initial: 500,
      max: Infinity,
      jitter: true
    },
    attempts: {
      max: 5
    }
  })

  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: from([retryLink, authLink, httpLink]),
    cache: cache().restore(initialState ?? {}),
    connectToDevTools: true
  })
}

export function useApolloClient({
  token,
  initialState
}: CreateApolloClientParams = {}): ApolloClient<NormalizedCacheObject> {
  return useMemo(
    () => createApolloClient({ token, initialState }),
    [token, initialState]
  )
}
