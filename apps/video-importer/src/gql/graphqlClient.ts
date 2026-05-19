import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { GraphQLClient } from 'graphql-request'

import { env } from '../env'
import { getFirebaseClient } from '../services/firebase'

// Caching for Firebase auth token and GraphQL client
let cachedFirebaseAuthToken: string | undefined
let cachedFirebaseAuthTokenIssueTime: number | undefined
let cachedGraphQLClient: GraphQLClient | undefined
let cachedGraphQLClientAuthToken: string | undefined

async function getFirebaseAuthToken(): Promise<string> {
  const now = Date.now()
  // 55 minutes in ms
  const TOKEN_EXPIRY_MS = 55 * 60 * 1000
  if (
    cachedFirebaseAuthToken &&
    cachedFirebaseAuthTokenIssueTime &&
    now - cachedFirebaseAuthTokenIssueTime < TOKEN_EXPIRY_MS
  ) {
    return cachedFirebaseAuthToken
  }

  const { FIREBASE_EMAIL: email, FIREBASE_PASSWORD: password } = env

  const auth = getAuth(getFirebaseClient())
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  cachedFirebaseAuthToken = await userCredential.user.getIdToken()
  cachedFirebaseAuthTokenIssueTime = Date.now()
  return cachedFirebaseAuthToken
}

export async function getGraphQLClient(): Promise<GraphQLClient> {
  try {
    const authToken = await getFirebaseAuthToken()
    if (cachedGraphQLClient && cachedGraphQLClientAuthToken === authToken) {
      return cachedGraphQLClient
    }
    cachedGraphQLClient = new GraphQLClient(env.GRAPHQL_ENDPOINT, {
      headers: {
        Authorization: `JWT ${authToken}`,
        'x-graphql-client-name': 'video-importer'
      }
    })
    cachedGraphQLClientAuthToken = authToken
    return cachedGraphQLClient
  } catch (error) {
    console.error('Error getting GraphQL client:', error)
    throw error
  }
}
