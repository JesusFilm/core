import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { registerApolloClient } from '@apollo/client-integration-nextjs'

import { cache } from './cache'

export const { getClient: getApolloClient, query } = registerApolloClient(
  () => {
    const httpLink = createHttpLink({
      uri: process.env.NEXT_PUBLIC_GATEWAY_URL,
      headers: {
        'x-graphql-client-name': 'arclight',
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
)
