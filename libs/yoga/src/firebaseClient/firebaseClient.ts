import { ServiceAccount, cert, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { z } from 'zod'

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

const payloadSchema = z.object({
  name: z.string(),
  picture: z.string().nullable(),
  // iss: z.string(),
  // aud: z.string(),
  // auth_time: z.number(),
  user_id: z.string(),
  // sub: z.string(),
  // iat: z.number(),
  // exp: z.number(),
  email: z.string(),
  email_verified: z.boolean()
  // firebase: z.object({
  //   identities: z.object({
  //     email: z.array(z.string())
  //   }),
  //   sign_in_provider: z.string()
  // })
})

export const auth = getAuth(firebaseClient)

export async function getUserIdFromRequest(
  request: Request,
  payload?: unknown
): Promise<string | null> {
  const result = payloadSchema.safeParse(payload)
  if (result.success) return result.data.user_id

  if (process.env.NODE_ENV === 'test') return 'testUserId'
  const token = request.headers.get('Authorization')
  if (token == null || token === '') return null
  try {
    const { uid } = await auth.verifyIdToken(token.replace(/^JWT /g, ''))
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
  request: Request,
  payload?: unknown
): Promise<User | null> {
  const result = payloadSchema.safeParse(payload)
  if (result.success) {
    const {
      user_id: id,
      name,
      email,
      picture: imageUrl,
      email_verified: emailVerified
    } = result.data

    const firstName = name?.split(' ')?.slice(0, -1)?.join(' ') ?? ''
    const lastName = name?.split(' ')?.slice(-1)?.join(' ') ?? ''

    return {
      id,
      firstName,
      lastName,
      email,
      imageUrl,
      emailVerified
    }
  }

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
