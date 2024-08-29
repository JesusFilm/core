import {
  createInMemoryCache,
  useResponseCache
} from '@graphql-yoga/plugin-response-cache'
import { initContextCache } from '@pothos/core'
import { ServiceAccount, cert, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { createYoga, useReadinessCheck } from 'graphql-yoga'

import { prisma } from './lib/prisma'
import { schema } from './schema'
import { Context } from './schema/builder'

export const cache = createInMemoryCache()

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

async function requestToUserId(request: Request): Promise<string | null> {
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

export const yoga = createYoga({
  schema,
  context: async ({ request }) => {
    const userId = await requestToUserId(request)

    return {
      ...initContextCache(),
      userId
    } satisfies Context
  },
  plugins: [
    useReadinessCheck({
      endpoint: '/.well-known/apollo/server-health',
      check: async () => {
        await prisma.$queryRaw`SELECT 1`
      }
    }),
    process.env.NODE_ENV !== 'test'
      ? useResponseCache({
          session: () => null,
          cache
        })
      : {}
  ]
})
