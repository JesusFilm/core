import { ApolloClient, HttpLink, NormalizedCacheObject } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { isPast } from 'date-fns'
import jwtDecode, { JwtPayload } from 'jwt-decode'
import { useMemo } from 'react'

import { cache } from './cache'

const ssrMode = typeof window === 'undefined'
let apolloClient: ApolloClient<NormalizedCacheObject>

export function createApolloClient(
  token?: string
): ApolloClient<NormalizedCacheObject> {
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GATEWAY_URL
  })

  let _token = token
  const authLink = setContext(async (_, { headers }) => {
    if (!ssrMode && _token != null) {
      const exp = jwtDecode<JwtPayload>(_token).exp
      if (exp == null || isPast(new Date(exp * 1000))) {
        const { getAuth } = await import(
          /* webpackChunkName: "firebase/auth" */
          'firebase/auth'
        )
        _token = await getAuth().currentUser?.getIdToken()
      }
    }

    return {
      headers: {
        ...(!ssrMode ? headers : []),
        Authorization: _token
      }
    }
  })

  return new ApolloClient({
    ssrMode,
    link: authLink.concat(httpLink),
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
