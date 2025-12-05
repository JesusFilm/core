import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'

/**
 * Creates an Apollo Client instance for GraphQL operations
 * @param apiName - The name of the API service (e.g., 'api-media', 'api-users')
 * @returns Configured Apollo Client instance
 */
export const createApolloClient = (apiName: string) => {
  const httpLink = createHttpLink({
    uri: process.env.GATEWAY_URL,
    headers: {
      'interop-token': process.env.INTEROP_TOKEN ?? '',
      'x-graphql-client-name': apiName,
      'x-graphql-client-version': process.env.SERVICE_VERSION ?? ''
    }
  })

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache()
  })
}
