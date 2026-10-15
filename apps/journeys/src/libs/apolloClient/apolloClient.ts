import { ApolloClient, HttpLink, NormalizedCacheObject } from '@apollo/client'
import { SetContextLink } from '@apollo/client/link/context'
import { User, onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { useMemo } from 'react'

import { firebaseAuth } from '../firebaseClient'

import { cache } from './cache'

const httpLink = new HttpLink({
  uri: process.env.GATEWAY_URL ?? '/api/graphql',
  headers: {
    'x-graphql-client-name': 'journeys',
    'x-graphql-client-version':
      process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? ''
  }
})

/**
 * Waits for Firebase Auth to finish loading persisted state (localStorage)
 * before deciding whether to create a new anonymous user. This prevents
 * minting a new UID on every page load and creating duplicate Visitors.
 */
function getOrCreateAnonymousUser(): Promise<User> {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      unsubscribe()
      if (user != null) {
        resolve(user)
        return
      }
      signInAnonymously(firebaseAuth).then(
        (credential) => resolve(credential.user),
        reject
      )
    })
  })
}

let userPromise: Promise<User> | null = null

const authLink = new SetContextLink(async ({ headers }) => {
  if (userPromise == null) {
    userPromise = getOrCreateAnonymousUser().catch((error) => {
      userPromise = null
      throw error
    })
  }
  const user = await userPromise

  const token = await user.getIdToken()

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
      enabled: true
    }
  })
}

export function useApollo(): ApolloClient {
  return useMemo(() => createApolloClient(), [])
}
