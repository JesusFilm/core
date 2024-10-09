import { ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { ServiceAccount, cert, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import get from 'lodash/get'
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
    : undefined
)

export const auth = getAuth(firebaseClient)

const payloadSchema = z
  .object({
    name: z.string().nullish(),
    picture: z.string().nullish(),
    user_id: z.string(),
    email: z.string(),
    email_verified: z.boolean()
  })
  .transform((data) => ({
    id: data.user_id,
    firstName: data.name?.split(' ').slice(0, -1).join(' ') ?? '',
    lastName: data.name?.split(' ').slice(-1).join(' '),
    email: data.email,
    imageUrl: data.picture,
    emailVerified: data.email_verified
  }))

export function contextToUserId(context: ExecutionContext): string | null {
  const ctx = GqlExecutionContext.create(context).getContext()
  const payload = get(ctx, 'req.body.extensions.jwt.payload')
  const result = payloadSchema.safeParse(payload)
  if (result.success) return result.data.id

  if (payload != null)
    console.error('contextToUserId failed to parse', result.error)

  return null
}

export function contextToUser(context: ExecutionContext): User | null {
  const ctx = GqlExecutionContext.create(context).getContext()
  const payload = get(ctx, 'req.body.extensions.jwt.payload')
  const result = payloadSchema.safeParse(payload)

  if (result.success) return result.data

  if (payload != null)
    console.error('contextToUser failed to parse', result.error)

  return null
}

export async function impersonateUser(userId: string): Promise<string> {
  return await auth.createCustomToken(userId)
}
