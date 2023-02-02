import { initializeApp, credential } from 'firebase-admin'
import { ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { get } from 'lodash'

export interface User {
  id: string
  firstName: string
  lastName?: string
  email: string
  imageUrl?: string
}

export const firebaseClient = initializeApp(
  process.env.GOOGLE_APPLICATION_JSON != null &&
    process.env.GOOGLE_APPLICATION_JSON !== ''
    ? {
        credential: credential.cert(
          JSON.parse(process.env.GOOGLE_APPLICATION_JSON)
        )
      }
    : undefined
)

export async function contextToUserId(
  context: ExecutionContext
): Promise<string | null> {
  const ctx = GqlExecutionContext.create(context).getContext()
  const token = get(ctx.headers, 'authorization')
  if (token == null || token === '') return null
  const { uid } = await firebaseClient.auth().verifyIdToken(token)
  return uid
}

export async function contextToUser(
  context: ExecutionContext
): Promise<User | null> {
  const userId = await contextToUserId(context)

  if (userId != null) {
    const { displayName, email, photoURL } = await firebaseClient
      .auth()
      .getUser(userId)

    const firstName = displayName?.split(' ')?.slice(0, -1)?.join(' ') ?? ''
    const lastName = displayName?.split(' ')?.slice(-1)?.join(' ') ?? ''

    return {
      id: userId,
      firstName,
      lastName,
      email: email ?? '',
      imageUrl: photoURL
    }
  }
  return null
}
