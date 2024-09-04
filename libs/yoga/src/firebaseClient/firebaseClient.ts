import { ServiceAccount, cert, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

export interface User {
  id: string
  firstName: string
  lastName?: string
  email: string
  imageUrl?: string | null
  emailVerified: boolean
}

export const firebaseClient = initializeApp(
  process.env.GOOGLE_APPLICATION_JSON != null &&
    process.env.GOOGLE_APPLICATION_JSON !== ''
    ? {
        credential: cert(
          JSON.parse(process.env.GOOGLE_APPLICATION_JSON) as ServiceAccount
        )
      }
    : undefined,
  'jfm-firebase-admin'
)

export const auth = getAuth(firebaseClient)

export async function getUserIdFromRequest(
  request: Request
): Promise<string | null> {
  if (process.env.NODE_ENV === 'test') return 'testUserId'
  const token = request.headers.get('Authorization')
  if (token == null || token === '') return null
  try {
    const { uid } = await auth.verifyIdToken(token)
    return uid
  } catch (err) {
    if (
      err instanceof Error &&
      'message' in err &&
      typeof err.message === 'string' &&
      err.message.includes('Decoding Firebase ID token failed.')
    )
      return null
    throw err
  }
}

export async function getUserFromRequest(
  request: Request
): Promise<User | null> {
  const userId = await getUserIdFromRequest(request)

  if (userId != null) {
    const { displayName, email, photoURL, emailVerified } = await auth.getUser(
      userId
    )

    const firstName = displayName?.split(' ')?.slice(0, -1)?.join(' ') ?? ''
    const lastName = displayName?.split(' ')?.slice(-1)?.join(' ') ?? ''

    return {
      id: userId,
      firstName,
      lastName,
      email: email ?? '',
      imageUrl: photoURL,
      emailVerified
    }
  }
  return null
}

export async function impersonateUser(userId: string): Promise<string> {
  return await auth.createCustomToken(userId)
}
