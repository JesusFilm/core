import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { registerApolloClient } from '@apollo/client-integration-nextjs'
import { cookies } from 'next/headers'
import { getTokens } from 'next-firebase-auth-edge'

import { cache } from './cache'

import { env } from '@/env'
import { authConfig } from '@/libs/auth/server-config'

export const {
  getClient: getApolloClient,
  query,
  PreloadQuery
} = registerApolloClient(async () => {
  const tokens = await getTokens(await cookies(), authConfig)

  const httpLink = new HttpLink({
    uri: env.NEXT_PUBLIC_GATEWAY_URL,
    headers: {
      'x-graphql-client-name': 'lumina',
      'x-graphql-client-version': env.NEXT_PUBLIC_DATADOG_VERSION ?? '',
      Authorization: tokens?.token != null ? `JWT ${tokens.token}` : ''
    },
    fetchOptions: {
      next: {
        revalidate: 60
      }
    }
  })

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(cache),
    connectToDevTools: process.env.NODE_ENV === 'development',
    defaultOptions: {
      query: {
        fetchPolicy: 'network-only'
      }
    }
  })
})
