'use client'

import {
  NormalizedCacheObject,
  createHttpLink,
  useApolloClient
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import {
  ApolloClient,
  ApolloNextAppProvider,
  InMemoryCache
} from '@apollo/client-integration-nextjs'
import { PropsWithChildren, ReactNode } from 'react'

import { cache } from '../../libs/apollo/cache'
import { User } from '../../libs/auth/authContext'

function UpdateAuth({
  token,
  children
}: {
  token?: string
  children: ReactNode
}) {
  const apolloClient = useApolloClient()

  if (token != null) {
    apolloClient.defaultContext.token = token
  }

  return <>{children}</>
}

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GATEWAY_URL,
  headers: {
    'x-graphql-client-name': 'videos-admin',
    'x-graphql-client-version':
      process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? ''
  }
})

export function ApolloProvider({
  children,
  user
}: PropsWithChildren & { user?: User | null }): ReactNode {
  const authLink = setContext(async (_, { headers, token }) => {
    return {
      headers: {
        ...headers,
        Authorization: token != null ? `JWT ${token}` : undefined
      }
    }
  })

  function makeClient(): ApolloClient<NormalizedCacheObject> {
    return new ApolloClient({
      cache: new InMemoryCache(cache),
      link: authLink.concat(httpLink),
      connectToDevTools: true
    })
  }

  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      <UpdateAuth token={user?.token}>{children}</UpdateAuth>
    </ApolloNextAppProvider>
  )
}
