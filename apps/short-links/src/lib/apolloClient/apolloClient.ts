import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { registerApolloClient } from '@apollo/client-integration-nextjs'

const ONE_HOUR_IN_SECONDS = 60 * 60 // 60 seconds times 60 minutes

export const { getClient: getApolloClient } = registerApolloClient(() => {
  const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_GATEWAY_URL,
    headers: {
      'x-graphql-client-name': 'short-links',
      'x-graphql-client-version':
        process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? ''
    },
    fetchOptions: {
      next: {
        revalidate: ONE_HOUR_IN_SECONDS
      }
    }
  })

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache()
  })
})
