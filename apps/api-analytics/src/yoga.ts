// eslint-disable-next-line import/order
import { tracer } from './tracer'

import { useStatsD } from '@envelop/statsd'
import { initContextCache } from '@pothos/core'
import { AttributeNames, SpanNames } from '@pothos/tracing-opentelemetry'
import { ASTNode, print } from 'graphql'
import { Plugin, createYoga, useReadinessCheck } from 'graphql-yoga'
import StatsD from 'hot-shots'

import { getUserFromApiKey } from './lib/auth'
import { prisma } from './lib/prisma'
import { schema } from './schema'
import { Context } from './schema/builder'

const dogStatsD = new StatsD({
  port: 8125 // DogStatsD port
})

export const tracingPlugin: Plugin = {
  onExecute: ({ setExecuteFn, executeFn }) => {
    setExecuteFn(
      async (options) =>
        await tracer.startActiveSpan(
          SpanNames.EXECUTE,
          {
            attributes: {
              [AttributeNames.OPERATION_NAME]:
                options.operationName ?? undefined,
              [AttributeNames.SOURCE]: print(options.document as ASTNode)
            }
          },
          async (span) => {
            try {
              const result = await executeFn(options)

              return result
            } catch (error) {
              span.recordException(error as Error)
              throw error
            } finally {
              span.end()
            }
          }
        )
    )
  }
}

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
