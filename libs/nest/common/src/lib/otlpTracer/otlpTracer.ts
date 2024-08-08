import { Tracer, trace } from '@opentelemetry/api'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { Resource } from '@opentelemetry/resources'
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions'
import {
  AttributeNames,
  SpanNames,
  createOpenTelemetryWrapper
} from '@pothos/tracing-opentelemetry'
import { ASTNode, print } from 'graphql'
import { Plugin } from 'graphql-yoga'

export default function otlpTracer(serviceName: string): {
  provider: NodeTracerProvider
  tracer: Tracer
  tracingPlugin: Plugin
  createSpanFn: ReturnType<typeof createOpenTelemetryWrapper>
} {
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SEMRESATTRS_SERVICE_NAME]: serviceName
    })
  })

  provider.addSpanProcessor(new SimpleSpanProcessor(new OTLPTraceExporter({})))

  provider.register()

  registerInstrumentations({
    instrumentations: [
      new HttpInstrumentation({
        ignoreIncomingRequestHook(req) {
          return req.url?.endsWith('/.well-known/apollo/server-health') !== true
        }
      })
    ]
  })

  const tracer = trace.getTracer('graphql')

  const tracingPlugin: Plugin = {
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

  const createSpanFn = createOpenTelemetryWrapper(tracer, {
    includeSource: true
  })

  return { provider, tracer, tracingPlugin, createSpanFn }
}
