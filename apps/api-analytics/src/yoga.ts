// eslint-disable-next-line import/order --- import tracer first
import { tracingPlugin } from './tracer'

import { initContextCache } from '@pothos/core'
import { createYoga, useReadinessCheck } from 'graphql-yoga'

import { getUserFromApiKey } from './lib/auth'
import { prisma } from './lib/prisma'
import { schema } from './schema'
import { Context } from './schema/builder'

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
