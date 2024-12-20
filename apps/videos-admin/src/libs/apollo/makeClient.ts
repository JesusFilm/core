import {
  ApolloClient,
  HttpOptions,
  InMemoryCache,
  NormalizedCacheObject,
  createHttpLink
} from '@apollo/client'

import { cache } from './cache'

export function makeClient(
  options?: HttpOptions
): ApolloClient<NormalizedCacheObject> {
  const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_GATEWAY_URL,
    ...options,
    headers: {
      ...options?.headers,
      'x-graphql-client-name': 'videos-admin',
      'x-graphql-client-version':
        process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? ''
    }
  })

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(cache),
    connectToDevTools: true
  })
}
