import { ApolloClient, HttpLink } from '@apollo/client'
import { SetContextLink } from '@apollo/client/link/context'
import { UserCredential, getAuth, signInAnonymously } from 'firebase/auth'
import { useMemo } from 'react'

import { firebaseClient } from '../firebaseClient'

import { cache } from './cache'

const httpLink = new HttpLink({
  uri: process.env.GATEWAY_URL ?? '/api/graphql',
  headers: {
    'x-graphql-client-name': 'journeys',
    'x-graphql-client-version':
      process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? ''
  }
})

let signInPromise: Promise<UserCredential>

const authLink = new SetContextLink(async ({ headers }, _) => {
  const auth = getAuth(firebaseClient)
  if (signInPromise == null) signInPromise = signInAnonymously(auth)
  const userCredential = await signInPromise

  const token = await userCredential.user.getIdToken()

  return {
    headers: {
      ...headers,
      Authorization: token != null ? `JWT ${token}` : undefined
    }
  }
})

export function createApolloClient(): ApolloClient {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: typeof window === 'undefined' ? httpLink : authLink.concat(httpLink),
    cache: cache(),
    devtools: {
      enabled: process.env.NODE_ENV === 'development'
    },
    clientAwareness: {
      name: 'journeys',
      version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? ''
    }
  })
}

export function useApollo(): ApolloClient {
  return useMemo(() => createApolloClient(), [])
}
