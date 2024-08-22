import { ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { ServiceAccount, cert, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import get from 'lodash/get'

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

export async function contextToUserId(
  context: ExecutionContext
): Promise<string | null> {
  const ctx = GqlExecutionContext.create(context).getContext()
  const token: string = get(ctx.headers, 'authorization')
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

export async function contextToUser(
  context: ExecutionContext
): Promise<User | null> {
  const userId = await contextToUserId(context)

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
