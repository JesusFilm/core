import {
  createInMemoryCache,
  useResponseCache
} from '@graphql-yoga/plugin-response-cache'
import { createYoga, useReadinessCheck } from 'graphql-yoga'

import { getUserFromAuthToken } from '@core/yoga/firebaseClient'

import { prisma } from './lib/prisma'
import { schema } from './schema'
import { Context } from './schema/builder'

export const cache = createInMemoryCache()

export const yoga = createYoga({
  schema,
  context: async ({ request }) => {
    // console.log('headers', request.headers)
    const token = request.headers.get('Authorization')
    // console.log('token', token)
    const currentUser =
      token == null || token === '' ? null : await getUserFromAuthToken(token)
    console.log('currentUser', currentUser)

    const result = {
      currentUser,
      currentRoles:
        currentUser != null
          ? (
              await prisma.videoAdminUser.findUnique({
                where: { userId: currentUser.id }
              })
            )?.roles ?? null
          : null,
      token
    }
    console.log('result', result)
    return result satisfies Context
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
