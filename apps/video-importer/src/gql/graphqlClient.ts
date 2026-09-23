import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { type TadaDocumentNode } from 'gql.tada'
import { print } from 'graphql'

import { env } from '../env'
import { getFirebaseClient } from '../services/firebase'

interface GraphQLResponseError {
  message: string
}

// Mirrors the `error.response.errors` shape callers already inspect
export class GraphQLClientError extends Error {
  constructor(
    message: string,
    readonly response: { status: number; errors?: GraphQLResponseError[] }
  ) {
    super(message)
    this.name = 'GraphQLClientError'
  }
}

export interface GraphQLClient {
  request: <Result, Variables = Record<string, unknown>>(
    document: string | TadaDocumentNode<Result, Variables>,
    variables?: Variables
  ) => Promise<Result>
}

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

function createGraphQLClient(
  endpoint: string,
  headers: Record<string, string>
): GraphQLClient {
  return {
    async request(document, variables) {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
          query: typeof document === 'string' ? document : print(document),
          variables
        })
      })
      if (!response.ok) {
        throw new GraphQLClientError(
          `GraphQL request failed: ${response.status} ${response.statusText}`,
          { status: response.status }
        )
      }
      const { data, errors } = (await response.json()) as {
        data?: unknown
        errors?: GraphQLResponseError[]
      }
      if (errors != null && errors.length > 0) {
        throw new GraphQLClientError(errors[0].message, {
          status: response.status,
          errors
        })
      }
      return data as never
    }
  }
}

export async function getGraphQLClient(): Promise<GraphQLClient> {
  try {
    const authToken = await getFirebaseAuthToken()
    if (cachedGraphQLClient && cachedGraphQLClientAuthToken === authToken) {
      return cachedGraphQLClient
    }
    cachedGraphQLClient = createGraphQLClient(env.GRAPHQL_ENDPOINT, {
      Authorization: `JWT ${authToken}`,
      'x-graphql-client-name': 'video-importer'
    })
    cachedGraphQLClientAuthToken = authToken
    return cachedGraphQLClient
  } catch (error) {
    console.error('Error getting GraphQL client:', error)
    throw error
  }
}
