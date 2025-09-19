import { LangfuseSpanProcessor, ShouldExportSpan } from '@langfuse/otel'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'

import { langfuseEnvironment } from './src/libs/ai/langfuse/server'

process.env.LANGFUSE_TRACING_ENVIRONMENT = langfuseEnvironment

const shouldExportSpan: ShouldExportSpan = ({ otelSpan }) => {
  return otelSpan.instrumentationScope.name !== 'next.js'
}

export const langfuseSpanProcessor = new LangfuseSpanProcessor({
  shouldExportSpan
})

const tracerProvider = new NodeTracerProvider({
  spanProcessors: [langfuseSpanProcessor]
})

tracerProvider.register()
