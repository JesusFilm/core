'use client'

import { createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import {
  ApolloNextAppProvider,
  NextSSRApolloClient,
  NextSSRInMemoryCache
} from '@apollo/experimental-nextjs-app-support/ssr'
import { UserCredential, getAuth, signInAnonymously } from 'firebase/auth'
import { ReactNode } from 'react'

import { cache } from '../../../libs/apolloClient/cache'
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
function makeClient(): NextSSRApolloClient<NextSSRInMemoryCache> {
  return new NextSSRApolloClient({
    cache: new NextSSRInMemoryCache(cache),
    link: typeof window === 'undefined' ? httpLink : authLink.concat(httpLink),
    name: 'watch',
    version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    connectToDevTools: true
  })
}

// you need to create a component to wrap your app in
export function ApolloWrapper({
  children
}: React.PropsWithChildren): ReactNode {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  )
}
