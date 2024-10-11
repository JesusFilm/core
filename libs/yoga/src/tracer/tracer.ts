import { trace } from '@opentelemetry/api'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { Resource } from '@opentelemetry/resources'
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions'
import { AttributeNames, SpanNames } from '@pothos/tracing-opentelemetry'
import { print } from 'graphql'
import { Plugin } from 'graphql-yoga'

export const provider = new NodeTracerProvider({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: process.env.SERVICE_NAME
  })
})

provider.addSpanProcessor(
  new SimpleSpanProcessor(
    new OTLPTraceExporter({
      url: 'http://localhost:4318'
    })
  )
)

provider.register()

registerInstrumentations({
  instrumentations: [new HttpInstrumentation({})]
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
