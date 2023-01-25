import { initializeApp, credential } from 'firebase-admin'
import { ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { get } from 'lodash'

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
