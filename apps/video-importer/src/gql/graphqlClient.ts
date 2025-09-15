import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { GraphQLClient } from 'graphql-request'

import { firebaseClient } from '../services/firebase'

const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT
if (!GRAPHQL_ENDPOINT) {
  throw new Error(
    '[video-importer] GRAPHQL_ENDPOINT environment variable must be set.'
  )
}

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

  const email = process.env.FIREBASE_EMAIL
  const password = process.env.FIREBASE_PASSWORD

  if (!email || !password) {
    throw new Error(
      'FIREBASE_EMAIL and FIREBASE_PASSWORD env variables must be set.'
    )
  }

  const auth = getAuth(firebaseClient)
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  cachedJwtToken = await userCredential.user.getIdToken()
  cachedJwtTokenIssueTime = Date.now()
  return cachedJwtToken
}

export async function getGraphQLClient(): Promise<GraphQLClient> {
  try {
    const jwtToken = process.env.JWT_TOKEN ?? (await getFirebaseJwtToken())
    if (cachedGraphQLClient && cachedGraphQLClientToken === jwtToken) {
      return cachedGraphQLClient
    }
    cachedGraphQLClient = new GraphQLClient(GRAPHQL_ENDPOINT!, {
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
