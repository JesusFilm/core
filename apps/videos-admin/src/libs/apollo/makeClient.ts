import {
  ApolloClient,
  ApolloClientOptions,
  InMemoryCache,
  NormalizedCacheObject,
  createHttpLink
} from '@apollo/client'

import { cache } from './cache'

export function makeClient(
  options?: Partial<ApolloClientOptions<NormalizedCacheObject>>
): ApolloClient<NormalizedCacheObject> {
  const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_GATEWAY_URL
  })

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(cache),
    name: 'watch',
    version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    connectToDevTools: true,
    ...options
  })
}
