'use client'

import { ApolloClient, HttpLink, InMemoryCache, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

import { env } from '@/env'

initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!
})

const authLink = setContext(async (_, { headers }) => {
  const user = getAuth().currentUser
  const token = user ? await user.getIdToken() : null
  return {
    headers: {
      ...headers,
      'x-graphql-client-name': 'lumina',
      'x-graphql-client-version': env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? '',
      Authorization: token ? `Bearer ${token}` : ''
    }
  }
})

const httpLink = new HttpLink({
  uri: env.NEXT_PUBLIC_GATEWAY_URL
})

export function makeClient() {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: from([authLink, httpLink])
  })
}
