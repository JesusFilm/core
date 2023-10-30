import {
  ApolloClient,
  NormalizedCacheObject,
  createHttpLink,
  from
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { RetryLink } from '@apollo/client/link/retry'
import fetch from 'cross-fetch'
import { useMemo } from 'react'

import { cache } from './cache'

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
    uri: process.env.NEXT_PUBLIC_GATEWAY_URL,
    fetch
  })

  const authLink = setContext(async (_, { headers }) => {
    // If this is SSR, DO NOT PASS THE REQUEST HEADERS.
    // Just send along the authorization headers.
    // The **correct** headers will be supplied by the `getServerSideProps` invocation of the query
    return {
      headers: {
        ...(!isSsrMode ? headers : []),
        Authorization: token ?? ''
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
    name: 'watch',
    version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    connectToDevTools:
      process.env.NEXT_PUBLIC_VERCEL_ENV !== 'production' &&
      process.env.NEXT_PUBLIC_VERCEL_ENV !== 'preview'
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
