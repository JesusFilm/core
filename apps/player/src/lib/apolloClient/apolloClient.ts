import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { registerApolloClient } from '@apollo/client-integration-nextjs'

import { env } from '../../env'

import { cache } from './cache'

export const { getClient: getApolloClient, query } = registerApolloClient(
  () => {
    const httpLink = createHttpLink({
      uri: env.NEXT_PUBLIC_GATEWAY_URL,
      headers: {
        'x-graphql-client-name': 'player',
        'x-graphql-client-version': env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? ''
      }
    })

    return new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache(cache),
      connectToDevTools: true
    })
  }
)
