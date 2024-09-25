import MutationQueueLink from '@adobe/apollo-link-mutation-queue'
import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  NormalizedCacheObject
} from '@apollo/client'
import { EntityStore, StoreObject } from '@apollo/client/cache'
import { setContext } from '@apollo/client/link/context'
import DebounceLink from 'apollo-link-debounce'
import { getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { useMemo } from 'react'

import { cache } from './cache'

const ssrMode = typeof window === 'undefined'
let apolloClient: ApolloClient<NormalizedCacheObject>

const DEFAULT_DEBOUNCE_TIMEOUT = 500

export function createApolloClient(
  token?: string
): ApolloClient<NormalizedCacheObject> {
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GATEWAY_URL
  })
  const authLink = setContext(async (_, { headers }) => {
    const firebaseToken = ssrMode
      ? token
      : (await getAuth(getApp()).currentUser?.getIdToken()) ?? token

    return {
      headers: {
        ...(!ssrMode ? headers : []),
        Authorization: firebaseToken
      }
    }
  })
  const mutationQueueLink = new MutationQueueLink()
  const debounceLink = new DebounceLink(DEFAULT_DEBOUNCE_TIMEOUT)

  const link = ApolloLink.from([
    debounceLink,
    mutationQueueLink,
    authLink,
    httpLink
  ])

  return new ApolloClient({
    ssrMode,
    link,
    cache: cache(),
    name: 'journeys-admin',
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

  // If your page has Next.js data fetching methods that use Apollo Client,
  // the initial state gets hydrated here
  if (initialState != null) {
    // Restore the cache using the data passed from
    // getStaticProps/getServerSideProps combined with the existing cached data
    // https://github.com/apollographql/apollo-client/issues/9797#issuecomment-1156604315
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- see gh ^
    const currentStore: EntityStore = (_apolloClient.cache as any).data

    Object.keys(initialState).forEach((dataId) => {
      currentStore.merge(dataId, initialState[dataId] as StoreObject)
    })
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
