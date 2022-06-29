import { ApolloClient, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { firebaseClient } from '../firebaseClient'
import { cache } from './cache'

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GATEWAY_URL
})

const authLink = setContext(async (_, { headers }) => {
  const auth = getAuth(firebaseClient)
  const userCredential = await signInAnonymously(auth)
  const token = await userCredential.user.getIdToken()

  return {
    headers: {
      ...headers,
      Authorization: token
    }
  }
})

export const apolloClient = new ApolloClient({
  link: typeof window === 'undefined' ? httpLink : authLink.concat(httpLink),
  cache: cache()
})
