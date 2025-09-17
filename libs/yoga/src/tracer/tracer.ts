import { trace } from '@opentelemetry/api'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION
} from '@opentelemetry/semantic-conventions'
import { AttributeNames, SpanNames } from '@pothos/tracing-opentelemetry'
import { print } from 'graphql'
import { Plugin } from 'graphql-yoga'

import { PrismaInstrumentation } from '@prisma/instrumentation'

const envAttributes = process.env.OTEL_RESOURCE_ATTRIBUTES ?? ''

// Parse the environment variable string into an object
const attributes = envAttributes
  .split(',')
  .reduce<Record<string, string>>((acc, curr) => {
    const [key, value] = curr.split('=')
    if (typeof key === 'string' && typeof value === 'string') {
      acc[key.trim()] = value.trim()
    }
    return acc
  }, {})

const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: process.env.SERVICE_NAME,
  [ATTR_SERVICE_VERSION]: attributes['service.version'] ?? '0.0.1'
})

export const provider = new NodeTracerProvider({
  resource,
  spanProcessors: [
    new SimpleSpanProcessor(
      new OTLPTraceExporter({
        url: 'http://0.0.0.0:4317'
      })
    )
  ]
})

provider.register()

registerInstrumentations({
  instrumentations: [
    new HttpInstrumentation({
      ignoreIncomingRequestHook: (req) =>
        req.url?.includes('/.well-known/apollo/server-health') ?? false
    }),
    new PrismaInstrumentation()
  ]
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
              [AttributeNames.SOURCE]: print(options.document)
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

export const tracer = trace.getTracer('graphql')
