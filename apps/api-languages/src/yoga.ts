import { useStatsD } from '@envelop/statsd'
import {
  createInMemoryCache,
  useResponseCache
} from '@graphql-yoga/plugin-response-cache'
import { createYoga, useReadinessCheck } from 'graphql-yoga'
import StatsD from 'hot-shots'

import { prisma } from './lib/prisma'
import { schema } from './schema'

const dogStatsD = new StatsD({
  port: 8125 // DogStatsD port
})

export const cache = createInMemoryCache()

export const yoga = createYoga({
  schema,
  plugins: [
    useStatsD({
      client: dogStatsD,
      prefix: 'gql',
      skipIntrospection: true
    }),
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
