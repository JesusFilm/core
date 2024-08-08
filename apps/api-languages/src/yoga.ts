// eslint-disable-next-line import/order
import { tracer } from './tracer'

import { useStatsD } from '@envelop/statsd'
import {
  createInMemoryCache,
  useResponseCache
} from '@graphql-yoga/plugin-response-cache'
import { AttributeNames, SpanNames } from '@pothos/tracing-opentelemetry'
import { ASTNode, print } from 'graphql'
import { Plugin, createYoga, useReadinessCheck } from 'graphql-yoga'
import StatsD from 'hot-shots'

import { prisma } from './lib/prisma'
import { schema } from './schema'

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

export const cache = createInMemoryCache()

export const yoga = createYoga({
  schema,
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
        await prisma.$queryRaw`SELECT 1`
      }
    }),
    useResponseCache({
      session: () => null,
      cache
    })
  ]
})
