import {
  ApolloClient,
  NormalizedCacheObject,
  createHttpLink
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { useMemo } from 'react'

import { cache } from './cache'

export function createApolloClient(
  token: string
): ApolloClient<NormalizedCacheObject> {
  const isSsrMode = typeof window === 'undefined'
  const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_GATEWAY_URL
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

  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: authLink.concat(httpLink),
    cache: cache(),
    name: 'journeys-admin',
    version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
  })
}

export function useApollo(token: string): ApolloClient<NormalizedCacheObject> {
  console.log('useApollo', token)
  return useMemo(() => createApolloClient(token), [token])
}
