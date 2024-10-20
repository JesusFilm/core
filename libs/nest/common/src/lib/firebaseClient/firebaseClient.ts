import { ExecutionContext, Logger } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { ServiceAccount, cert, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import get from 'lodash/get'
import { z } from 'zod'

export interface User {
  id: string
  firstName: string
  lastName?: string
  email?: string | null
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
    email: z.string().nullish(),
    email_verified: z.boolean().nullish()
  })
  .transform((data) => ({
    id: data.user_id,
    firstName: data.name?.split(' ').slice(0, -1).join(' ') ?? '',
    lastName: data.name?.split(' ').slice(-1).join(' '),
    email: data.email,
    imageUrl: data.picture,
    emailVerified: data.email_verified ?? false
  }))

export function contextToUserId(
  context: ExecutionContext,
  logger?: Logger
): string | null {
  const ctx = GqlExecutionContext.create(context).getContext()
  const payload = get(ctx, 'req.body.extensions.jwt.payload')
  const result = payloadSchema.safeParse(payload)
  if (result.success) return result.data.id

  if (payload != null)
    logger?.error('contextToUserId failed to parse', result.error)

  return null
}

export function contextToUser(
  context: ExecutionContext,
  logger?: Logger
): User | null {
  const ctx = GqlExecutionContext.create(context).getContext()
  const payload = get(ctx, 'req.body.extensions.jwt.payload')
  const result = payloadSchema.safeParse(payload)

  if (result.success) return result.data

  if (payload != null)
    logger?.error('contextToUser failed to parse', result.error)

  return null
}

export async function impersonateUser(userId: string): Promise<string> {
  return await auth.createCustomToken(userId)
}
