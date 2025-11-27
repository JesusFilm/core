'use client'

import { type NormalizedCacheObject, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import {
  ApolloClient,
  ApolloNextAppProvider,
  InMemoryCache
} from '@apollo/client-integration-nextjs'
import { type PropsWithChildren, type ReactNode } from 'react'

import { cache } from '@/libs/apollo/cache'
import { env } from '@/env'

const httpLink = createHttpLink({
  uri: env.NEXT_PUBLIC_GATEWAY_URL,
  headers: {
    'x-graphql-client-name': 'lumina',
    'x-graphql-client-version': env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? ''
  }
})

export function ApolloProvider({
  children,
  token
}: PropsWithChildren & {
  token?: string | null
}): ReactNode {
  function makeClient(): ApolloClient<NormalizedCacheObject> {
    const authLink = setContext(async (_, { headers }) => {
      return {
        headers: {
          ...headers,
          Authorization: token != null ? `JWT ${token}` : undefined
        }
      }
    })

    return new ApolloClient({
      cache: new InMemoryCache(cache),
      link: authLink.concat(httpLink),
      connectToDevTools: true
    })
  }

  return (
    <ApolloNextAppProvider key={token ?? 'no-token'} makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  )
}
