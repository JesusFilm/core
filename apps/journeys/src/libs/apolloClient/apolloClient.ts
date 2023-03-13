import {
  ApolloClient,
  createHttpLink,
  NormalizedCacheObject
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { useMemo } from 'react'
import { firebaseClient } from '../firebaseClient'
import { cache } from './cache'

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GATEWAY_URL
})

const authLink = setContext(async (_, { headers }) => {
  const isSsrMode = typeof window === 'undefined'
  const auth = getAuth(firebaseClient)
  const userCredential = await signInAnonymously(auth)
  const token = await userCredential.user.getIdToken()

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

export function createApolloClient(): ApolloClient<NormalizedCacheObject> {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: typeof window === 'undefined' ? httpLink : authLink.concat(httpLink),
    cache: cache(),
    name: 'journeys',
    version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
  })
}

export function useApollo(): ApolloClient<NormalizedCacheObject> {
  return useMemo(() => createApolloClient(), [])
}
