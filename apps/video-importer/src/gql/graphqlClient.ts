import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { GraphQLClient } from 'graphql-request'

import { env } from '../env'
import { getFirebaseClient } from '../services/firebase'

// Caching for JWT token and GraphQL client
let cachedJwtToken: string | undefined
let cachedJwtTokenIssueTime: number | undefined
let cachedGraphQLClient: GraphQLClient | undefined
let cachedGraphQLClientToken: string | undefined

async function getFirebaseJwtToken(): Promise<string> {
  const now = Date.now()
  // 55 minutes in ms
  const TOKEN_EXPIRY_MS = 55 * 60 * 1000
  if (
    cachedJwtToken &&
    cachedJwtTokenIssueTime &&
    now - cachedJwtTokenIssueTime < TOKEN_EXPIRY_MS
  ) {
    return cachedJwtToken
  }

  const { FIREBASE_EMAIL: email, FIREBASE_PASSWORD: password } = env
  if (!email || !password) {
    throw new Error(
      '[video-importer] If JWT_TOKEN is not set, FIREBASE_EMAIL and FIREBASE_PASSWORD must be set.'
    )
  }

  const auth = getAuth(getFirebaseClient())
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  cachedJwtToken = await userCredential.user.getIdToken()
  cachedJwtTokenIssueTime = Date.now()
  return cachedJwtToken
}

export async function getGraphQLClient(): Promise<GraphQLClient> {
  try {
    const jwtToken = env.JWT_TOKEN ?? (await getFirebaseJwtToken())
    if (cachedGraphQLClient && cachedGraphQLClientToken === jwtToken) {
      return cachedGraphQLClient
    }
    cachedGraphQLClient = new GraphQLClient(env.GRAPHQL_ENDPOINT, {
      headers: {
        Authorization: `JWT ${jwtToken}`,
        'x-graphql-client-name': 'video-importer'
      }
    })
    cachedGraphQLClientToken = jwtToken
    return cachedGraphQLClient
  } catch (error) {
    console.error('Error getting GraphQL client:', error)
    throw error
  }
}
