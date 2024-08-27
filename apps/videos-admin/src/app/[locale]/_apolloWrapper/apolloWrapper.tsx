'use client'

import { NormalizedCacheObject, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import {
  ApolloClient,
  ApolloNextAppProvider,
  InMemoryCache
} from '@apollo/experimental-nextjs-app-support'
import { UserCredential, getAuth, signInAnonymously } from 'firebase/auth'
import { PropsWithChildren, ReactNode } from 'react'

import { cache } from '../../../libs/apollo'
import { firebaseClient } from '../../../libs/firebaseClient/firebaseClient'

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GATEWAY_URL
})

let signInPromise: Promise<UserCredential>

const authLink = setContext(async (_, { headers }) => {
  const auth = getAuth(firebaseClient)
  if (signInPromise == null) signInPromise = signInAnonymously(auth)
  const userCredential = await signInPromise

  const token = await userCredential.user.getIdToken()

  return {
    headers: {
      ...headers,
      Authorization: token ?? ''
    }
  }
})

// have a function to create a client for you
function makeClient(): ApolloClient<NormalizedCacheObject> {
  return new ApolloClient({
    cache: new InMemoryCache(cache),
    link: typeof window === 'undefined' ? httpLink : authLink.concat(httpLink),
    name: 'watch',
    version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    connectToDevTools: true
  })
}

// you need to create a component to wrap your app in
export function ApolloWrapper({ children }: PropsWithChildren): ReactNode {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  )
}
