import { LangfuseSpanProcessor, ShouldExportSpan } from '@langfuse/otel'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'

import { langfuseEnvironment } from './src/lib/ai/langfuse/server'

// Set the Langfuse tracing environment early in the application lifecycle
// const langfuseEnvironment =
//   process.env.VERCEL_ENV ??
//   process.env.DD_ENV ??
//   process.env.NODE_ENV ??
//   'development'

process.env.LANGFUSE_TRACING_ENVIRONMENT = langfuseEnvironment

const shouldExportSpan: ShouldExportSpan = ({ otelSpan }) => {
  return otelSpan.instrumentationScope.name !== 'next.js'
}

export const langfuseSpanProcessor = new LangfuseSpanProcessor({
  shouldExportSpan,
  flushAt: 1 // Flush each event immediately
})

const tracerProvider = new NodeTracerProvider({
  spanProcessors: [langfuseSpanProcessor]
})

tracerProvider.register()
