import type { ActiveSession } from '../../auth/login'
import { resolveFirebaseApiKey } from '../../config/environments'
import { graphqlRequest } from '../../graphql/client'

export interface MeUser {
  id: string
  email: string | null
  superAdmin: boolean
}

interface MeQueryData {
  me: {
    id: string
    email: string | null
    superAdmin: boolean
  } | null
}

const ME_QUERY = /* GraphQL */ `
  query ScribeMe {
    me {
      __typename
      ... on AuthenticatedUser {
        id
        email
        superAdmin
      }
    }
  }
`

export async function fetchMe(session: ActiveSession): Promise<MeUser | null> {
  const data = await graphqlRequest<MeQueryData>(session, {
    query: ME_QUERY,
    operationName: 'ScribeMe'
  })
  return data.me
}

const USER_IMPERSONATE = /* GraphQL */ `
  mutation ScribeUserImpersonate($email: String!) {
    userImpersonate(email: $email)
  }
`

interface UserImpersonateData {
  userImpersonate: string | null
}

/**
 * Calls the superadmin-only `userImpersonate` mutation and returns a Firebase
 * **custom** token for the target user. The custom token must then be
 * exchanged for an ID token via {@link exchangeCustomTokenForIdToken} before
 * it can be used as an Authorization header.
 */
export async function requestImpersonationCustomToken(
  session: ActiveSession,
  email: string
): Promise<string> {
  const data = await graphqlRequest<UserImpersonateData>(session, {
    query: USER_IMPERSONATE,
    variables: { email },
    operationName: 'ScribeUserImpersonate'
  })
  if (data.userImpersonate == null) {
    throw new Error(
      `userImpersonate returned no token for "${email}".`
    )
  }
  return data.userImpersonate
}

interface FirebaseSignInResult {
  idToken: string
  refreshToken: string
  expiresIn: string
  localId: string
}

/**
 * Exchange a Firebase custom token for an ID token via the public identity
 * toolkit REST API. The API key is the same Firebase web API key that
 * journeys-admin uses (it's intended for client-side embedding).
 */
export async function exchangeCustomTokenForIdToken(
  session: ActiveSession,
  customToken: string
): Promise<FirebaseSignInResult> {
  const apiKey = resolveFirebaseApiKey(session.environment)
  if (apiKey == null) {
    throw new Error(
      `Firebase API key for ${session.environment.id} is not configured. Set SCRIBE_FIREBASE_API_KEY_${session.environment.id.toUpperCase()} in your shell, or fill in firebaseApiKey in apps/scribe/src/config/environments.ts.`
    )
  }
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: customToken,
      returnSecureToken: true
    })
  })
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(
      `Firebase token exchange failed (HTTP ${response.status}): ${detail.slice(0, 240)}`
    )
  }
  const json = (await response.json()) as Partial<FirebaseSignInResult>
  if (
    typeof json.idToken !== 'string' ||
    typeof json.localId !== 'string' ||
    typeof json.refreshToken !== 'string' ||
    typeof json.expiresIn !== 'string'
  ) {
    throw new Error('Firebase token exchange returned malformed response.')
  }
  return json as FirebaseSignInResult
}
