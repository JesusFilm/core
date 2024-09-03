import {
  createInMemoryCache,
  useResponseCache
} from '@graphql-yoga/plugin-response-cache'
import { initContextCache } from '@pothos/core'
import { createYoga, useReadinessCheck } from 'graphql-yoga'

import { getUserIdFromRequest } from '@core/yoga/firebaseClient/firebaseClient'

import { prisma } from './lib/prisma'
import { schema } from './schema'
import { Context } from './schema/builder'

export const cache = createInMemoryCache()

export const yoga = createYoga({
  schema,
  context: async ({ request }) => {
    const userId = await getUserIdFromRequest(request)

    return {
      ...initContextCache(),
      userId,
      currentRoles:
        userId != null
          ? (
              await prisma.videoAdminUser.findUnique({
                where: { userId }
              })
            )?.roles ?? null
          : null
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
