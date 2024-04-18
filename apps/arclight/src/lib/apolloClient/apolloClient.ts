import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { registerApolloClient } from '@apollo/experimental-nextjs-app-support/rsc'

import { cache } from './cache'

export const { getClient: getApolloClient } = registerApolloClient(() => {
  const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_GATEWAY_URL
  })

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(cache),
    name: 'watch',
    version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    connectToDevTools: true
  })
})
