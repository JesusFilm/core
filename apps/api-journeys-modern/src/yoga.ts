import { useHmacSignatureValidation } from '@graphql-hive/gateway'
import {
  createInMemoryCache,
  useResponseCache
} from '@graphql-yoga/plugin-response-cache'
import { createYoga, useReadinessCheck } from 'graphql-yoga'

import { prisma } from './lib/prisma'
import { logger } from './logger'
import { schema } from './schema'

export const cache = createInMemoryCache()

export const yoga = createYoga({
  schema,
  logging: logger,
  plugins: [
    process.env.NODE_ENV !== 'test'
      ? useHmacSignatureValidation({
          secret: process.env.GATEWAY_HMAC_SECRET ?? ''
        })
      : {},
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
