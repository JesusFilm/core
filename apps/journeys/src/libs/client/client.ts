import {
  ApolloClient,
  createHttpLink,
  NormalizedCacheObject
} from '@apollo/client'
import { cache } from './cache'
import { setContext } from '@apollo/client/link/context'

export function createApolloClient(
  token?: string
): ApolloClient<NormalizedCacheObject> {
  const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_GATEWAY_URL
  })

  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        Authorization: token ?? ''
      }
    }
  })

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache
  })
}

const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_GATEWAY_URL,
  cache
})

export default client
