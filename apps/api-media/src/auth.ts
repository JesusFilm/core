import { ServiceAccount, cert, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const firebaseClient = initializeApp(
  process.env.GOOGLE_APPLICATION_JSON != null &&
    process.env.GOOGLE_APPLICATION_JSON !== ''
    ? {
        credential: cert(
          JSON.parse(process.env.GOOGLE_APPLICATION_JSON) as ServiceAccount
        )
      }
    : undefined
)

const auth = getAuth(firebaseClient)

export async function requestToUserId(
  request: Request
): Promise<string | null> {
  if (process.env.NODE_ENV === 'test') return 'testUserId'

  const token = request.headers.get('authorization')
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
