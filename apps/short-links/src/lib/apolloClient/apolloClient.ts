import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { registerApolloClient } from '@apollo/experimental-nextjs-app-support'

export const { getClient: getApolloClient, query } = registerApolloClient(
  () => {
    const httpLink = createHttpLink({
      uri: process.env.NEXT_PUBLIC_GATEWAY_URL,
      headers: {
        'x-graphql-client-name': 'short-links',
        'x-graphql-client-version':
          process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? ''
      }
    })

    return new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache(),
      connectToDevTools: true
    })
  }
)
