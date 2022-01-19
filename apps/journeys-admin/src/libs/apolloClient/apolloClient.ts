import {
  ApolloClient,
  createHttpLink,
  NormalizedCacheObject
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import merge from 'deepmerge'
import { isEqual } from 'lodash'
import { AuthUser } from 'next-firebase-auth'
import { AppProps } from 'next/app'
import { useMemo } from 'react'
import { cache } from './cache'

export const APOLLO_STATE_PROP_NAME = '__APOLLO_STATE__'

let apolloClient: ApolloClient<NormalizedCacheObject> | undefined

export function createApolloClient(
  AuthUser: AuthUser
): ApolloClient<NormalizedCacheObject> {
  const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_GATEWAY_URL
  })

  const authLink = setContext(async (_, { headers }) => {
    const Authorization = await AuthUser.getIdToken()
    return {
      headers: {
        ...headers,
        Authorization
      }
    }
  })

  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: authLink.concat(httpLink),
    cache
  })
}

export function initializeApollo({
  initialState,
  AuthUser
}: {
  initialState?: NormalizedCacheObject
  AuthUser: AuthUser
}): ApolloClient<NormalizedCacheObject> {
  const _apolloClient = apolloClient ?? createApolloClient(AuthUser)

  // If your page has Next.js data fetching methods that use Apollo Client,
  // the initial state gets hydrated here
  if (initialState != null) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract()

    // Merge the existing cache into data passed from getStaticProps/getServerSideProps
    const data = merge(initialState, existingCache, {
      // combine arrays using object equality (like in sets)
      arrayMerge: (destinationArray, sourceArray) => [
        ...sourceArray,
        ...destinationArray.filter((d) =>
          sourceArray.every((s) => !isEqual(d, s))
        )
      ]
    })

    // Restore the cache with the merged data
    _apolloClient.cache.restore(data)
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient
  // Create the Apollo Client once in the client
  if (apolloClient == null) apolloClient = _apolloClient

  return _apolloClient
}

export function addApolloState(
  client: ApolloClient<NormalizedCacheObject>,
  pageProps: AppProps['pageProps']
): AppProps['pageProps'] {
  if (pageProps?.props != null) {
    pageProps.props[APOLLO_STATE_PROP_NAME] = client.cache.extract()
  }

  return pageProps
}

export function useApollo(
  AuthUser: AuthUser,
  pageProps: AppProps['pageProps']
): ApolloClient<NormalizedCacheObject> {
  const initialState = pageProps[APOLLO_STATE_PROP_NAME]
  const store = useMemo(
    () => initializeApollo({ AuthUser, initialState }),
    [AuthUser, initialState]
  )
  return store
}
