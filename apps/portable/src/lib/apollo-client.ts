import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AsyncStorageWrapper, persistCache } from 'apollo3-cache-persist'

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql'
})

const cache = new InMemoryCache()

// Persist cache using AsyncStorage
persistCache({
  cache,
  storage: new AsyncStorageWrapper(AsyncStorage)
}).then(() => {
  console.log('Apollo cache persisted')
})

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all'
    },
    query: {
      errorPolicy: 'all'
    }
  }
})
