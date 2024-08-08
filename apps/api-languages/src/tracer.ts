import { trace } from '@opentelemetry/api'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { Resource } from '@opentelemetry/resources'
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions'

export const provider = new NodeTracerProvider({
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: 'api-languages'
  })
})

provider.addSpanProcessor(new SimpleSpanProcessor(new OTLPTraceExporter({})))

provider.register()

registerInstrumentations({
  instrumentations: [new HttpInstrumentation({})]
})

export const tracer = trace.getTracer('graphql')
