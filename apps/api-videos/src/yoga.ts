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
    const token = request.headers.get('authorization')
    const currentUser =
      token == null || token === '' ? null : await getUserFromAuthToken(token)

    return {
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
