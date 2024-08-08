import { useStatsD } from '@envelop/statsd'
import { initContextCache } from '@pothos/core'
import { createYoga, useReadinessCheck } from 'graphql-yoga'
import StatsD from 'hot-shots'

import { getUserFromApiKey } from './lib/auth'
import { prisma } from './lib/prisma'
import { schema } from './schema'
import { Context } from './schema/builder'
import { tracingPlugin } from './tracer'

const dogStatsD = new StatsD({
  port: 8125 // DogStatsD port
})

export const yoga = createYoga({
  schema,
  context: async ({ request }) => {
    const apiKey = request.headers
      .get('authorization')
      ?.replace(/^Bearer\s/, '')

    return {
      ...initContextCache(),
      currentUser: await getUserFromApiKey(apiKey),
      apiKey
    } satisfies Context
  },
  plugins: [
    tracingPlugin,
    useStatsD({
      client: dogStatsD,
      prefix: 'gql',
      skipIntrospection: true
    }),
    useReadinessCheck({
      endpoint: '/.well-known/apollo/server-health',
      check: async () => {
        // if resolves, respond with 200 OK
        // if throw, respond with 503 Service Unavailable
        await prisma.$queryRaw`SELECT 1`
      }
    })
  ]
})
