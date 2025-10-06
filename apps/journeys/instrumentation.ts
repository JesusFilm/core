import { LangfuseSpanProcessor, ShouldExportSpan } from '@langfuse/otel'
import { registerOTel } from '@vercel/otel'

import { langfuseEnvironment } from './src/lib/ai/langfuse/server'

process.env.LANGFUSE_TRACING_ENVIRONMENT = langfuseEnvironment

// Only export AI-related spans to Langfuse (HTTP/Next.js already in Datadog)
const shouldExportSpan: ShouldExportSpan = ({ otelSpan }) => {
  const scopeName = otelSpan.instrumentationScope.name
  const spanName = otelSpan.name

  // Export AI SDK spans (they use 'ai' as scope name, not 'ai.')
  // Export Langfuse-related spans
  // Export custom AI operation spans
  return (
    scopeName === 'ai' ||
    scopeName.startsWith('ai.') ||
    scopeName.includes('langfuse') ||
    spanName.includes('ai.') ||
    spanName.includes('generateText') ||
    spanName.includes('streamText')
  )
}

const langfuseSpanProcessor = new LangfuseSpanProcessor({
  shouldExportSpan
})

// Register Vercel OTel with Langfuse processor for AI tracing
registerOTel({
  serviceName: 'journeys-ai',
  spanProcessors: [langfuseSpanProcessor]
})

// Export flush function for serverless environments
export const flush = async () => {
  await langfuseSpanProcessor.forceFlush()
}
