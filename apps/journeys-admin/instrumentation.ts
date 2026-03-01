import { registerOTel } from '@vercel/otel'

import { langfuseSpanProcessor } from './src/libs/ai/langfuse/server'

export function register() {
  // Debug: verify that instrumentation is being registered at runtime
  // eslint-disable-next-line no-console
  console.log('[OTel] Registering instrumentation for journeys-admin')

  registerOTel({
    serviceName: 'journeys-admin',
    spanProcessors: ['auto', langfuseSpanProcessor]
  })
}
