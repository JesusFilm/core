import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

import { env } from '../../env'

import { cache } from './cache'

export function makeClient(options?: HttpLink.Options): ApolloClient {
  const httpLink = new HttpLink({
    uri: env.NEXT_PUBLIC_GATEWAY_URL,
    ...options,
    headers: {
      ...options?.headers,
      'x-graphql-client-name': 'short-links-admin',
      'x-graphql-client-version': env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? ''
    }
  })

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(cache),

    devtools: {
      enabled: true
    }
  })
}
