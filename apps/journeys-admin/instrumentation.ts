import { registerOTel } from '@vercel/otel'

import { langfuseExporter } from './src/libs/ai/langfuse/server'

export function register() {
  registerOTel({
    serviceName: 'journeys-admin',
    traceExporter: langfuseExporter
  })
}
