import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  NormalizedCacheObject
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { useMemo } from 'react'

import { cache } from './cache'

let apolloClient: ApolloClient<NormalizedCacheObject>

export function createApolloClient(
  token?: string
): ApolloClient<NormalizedCacheObject> {
  const isSsrMode = typeof window === 'undefined'

  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GATEWAY_URL
  })

  const httpSwitchyLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_SWITCHY_GATEWAY_URL,
    headers: {
      'Api-Authorization': process.env.NEXT_PUBLIC_SWITCHY_WORKSPACE_KEY ?? ''
    }
  })

  const authLink = setContext(async (_, { headers }) => {
    const firebaseToken = isSsrMode
      ? token
      : (await getAuth(getApp()).currentUser?.getIdToken()) ?? token

    return {
      headers: {
        ...(!isSsrMode ? headers : []),
        Authorization: firebaseToken
      }
    }
  })

  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: ApolloLink.split(
      (operation) => operation.getContext().clientName === 'switchy',
      httpSwitchyLink,
      authLink.concat(httpLink)
    ),
    cache: cache(),
    name: 'nexus-admin',
    version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    connectToDevTools: true
  })
}

interface InitializeApolloOptions {
  token?: string
  initialState?: NormalizedCacheObject
}

export function initializeApollo({
  token,
  initialState
}: InitializeApolloOptions): ApolloClient<NormalizedCacheObject> {
  const _apolloClient = apolloClient ?? createApolloClient(token)

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState != null) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract()
    // Restore the cache using the data passed from getStaticProps/getServerSideProps
    // combined with the existing cached data
    _apolloClient.cache.restore({ ...existingCache, ...initialState })
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient
  // Create the Apollo Client once in the client
  if (apolloClient == null) apolloClient = _apolloClient
  return _apolloClient
}

export function useApollo({
  token,
  initialState
}: InitializeApolloOptions): ApolloClient<NormalizedCacheObject> {
  const store = useMemo(
    () => initializeApollo({ token, initialState }),
    [token, initialState]
  )
  return store
}
