import {
  ApolloClient,
} from '@apollo/client'
import { cache } from './cache'

const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_GATEWAY_URL,
  cache
})

export default client
