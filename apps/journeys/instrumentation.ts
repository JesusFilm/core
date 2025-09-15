import { LangfuseSpanProcessor, ShouldExportSpan } from '@langfuse/otel'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'

// Set the Langfuse tracing environment early in the application lifecycle
const langfuseEnvironment =
  process.env.VERCEL_ENV ??
  process.env.DD_ENV ??
  process.env.NODE_ENV ??
  'development'

process.env.LANGFUSE_TRACING_ENVIRONMENT = langfuseEnvironment

const shouldExportSpan: ShouldExportSpan = ({ otelSpan }) => {
  return otelSpan.instrumentationScope.name !== 'next.js'
}

export const langfuseSpanProcessor = new LangfuseSpanProcessor({
  shouldExportSpan,
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.LANGFUSE_BASE_URL
})

const tracerProvider = new NodeTracerProvider({
  spanProcessors: [langfuseSpanProcessor]
})

tracerProvider.register()
