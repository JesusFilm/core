import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { registerApolloClient } from '@apollo/client-integration-nextjs'
import { cookies } from 'next/headers'
import { getTokens } from 'next-firebase-auth-edge'

import { authConfig } from '../auth'

import { cache } from './cache'

export const {
  getClient: getApolloClient,
  query,
  PreloadQuery
} = registerApolloClient(async () => {
  const tokens = await getTokens(cookies(), authConfig)

  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GATEWAY_URL,
    headers: {
      'x-graphql-client-name': 'videos-admin',
      'x-graphql-client-version':
        process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? '',
      Authorization: tokens?.token != null ? `JWT ${tokens.token}` : ''
    },
    fetchOptions: {
      // Next.js specific options for caching and revalidation
      // See: https://nextjs.org/docs/app/api-reference/functions/fetch#fetchurl-options
      next: {
        revalidate: 60 // Adjust based on your needs
      }
    }
  })

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(cache),
    connectToDevTools: process.env.NODE_ENV === 'development',
    // Prevent shared cache between RSC and client components to avoid conflicts
    defaultOptions: {
      query: {
        fetchPolicy: 'network-only'
      }
    }
  })
})
