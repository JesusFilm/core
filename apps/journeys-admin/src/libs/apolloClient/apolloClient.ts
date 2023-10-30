import {
  ApolloClient,
  NormalizedCacheObject,
  createHttpLink
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
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
    link: authLink.concat(httpLink),
    cache: cache(),
    name: 'journeys-admin',
    version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    connectToDevTools:
      process.env.NEXT_PUBLIC_VERCEL_ENV !== 'production' &&
      process.env.NEXT_PUBLIC_VERCEL_ENV !== 'preview'
  })
}

export function useApollo(token: string): ApolloClient<NormalizedCacheObject> {
  return useMemo(() => createApolloClient(token), [token])
}
