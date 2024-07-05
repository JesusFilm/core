import {
  createInMemoryCache,
  useResponseCache
} from '@graphql-yoga/plugin-response-cache'
import { createYoga, useReadinessCheck } from 'graphql-yoga'

import { prisma } from './lib/prisma'
import { schema } from './schema'

export const cache = createInMemoryCache()

export const yoga = createYoga({
  schema,
  plugins: [
    useReadinessCheck({
      endpoint: '/.well-known/apollo/server-health',
      check: async () => {
        await prisma.$queryRaw`SELECT 1`
      }
    }),
    useResponseCache({
      session: () => null,
      cache
    })
  ]
})
