import {
  ApolloClient,
  NormalizedCacheObject,
  createHttpLink,
  from
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { RetryLink } from '@apollo/client/link/retry'
import { InMemoryCache } from '@apollo/client/cache'
import fetch from 'cross-fetch'
import { useMemo } from 'react'

interface CreateApolloClientParams {
  token?: string
  initialState?: NormalizedCacheObject
}

export function createApolloClient({
  token,
  initialState
}: CreateApolloClientParams = {}): ApolloClient<NormalizedCacheObject> {
  const isSsrMode = typeof window === 'undefined'
  const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:4000/graphql',
    fetch
  })

  const authLink = setContext(async (_, { headers }) => {
    return {
      headers: {
        ...(!isSsrMode ? headers : []),
        Authorization: token != null ? `JWT ${token}` : undefined,
        'x-graphql-client-name': 'cropper',
        'x-graphql-client-version': process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? ''
      }
    }
  })

  const retryLink = new RetryLink({
    delay: {
      initial: 500,
      max: Number.POSITIVE_INFINITY,
      jitter: true
    },
    attempts: {
      max: 5
    }
  })

  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: from([retryLink, authLink, httpLink]),
    cache: new InMemoryCache().restore(initialState ?? {}),
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
