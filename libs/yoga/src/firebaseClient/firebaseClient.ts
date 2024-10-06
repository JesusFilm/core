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

const payloadSchema = z
  .object({
    name: z.string(),
    picture: z.string().nullable(),
    user_id: z.string(),
    email: z.string(),
    email_verified: z.boolean()
  })
  .transform((data) => ({
    id: data.user_id,
    firstName: data.name.split(' ').slice(0, -1).join(' '),
    lastName: data.name.split(' ').slice(-1).join(' '),
    email: data.email,
    imageUrl: data.picture,
    emailVerified: data.email_verified
  }))

export const auth = getAuth(firebaseClient)

export async function getUserIdFromPayload(
  payload: unknown
): Promise<string | null> {
  if (process.env.NODE_ENV === 'test') return 'testUserId'

  const result = payloadSchema.safeParse(payload)
  if (result.success) return result.data.id

  return null
}

export async function getUserFromPayload(
  payload: unknown
): Promise<User | null> {
  if (process.env.NODE_ENV === 'test')
    return {
      id: 'testUserId',
      firstName: 'Test',
      lastName: 'User',
      email: 'text@example.com',
      emailVerified: true,
      imageUrl: null
    }

  const result = payloadSchema.safeParse(payload)
  if (result.success) return result.data

  return null
}

export async function impersonateUser(userId: string): Promise<string> {
  return await auth.createCustomToken(userId)
}
