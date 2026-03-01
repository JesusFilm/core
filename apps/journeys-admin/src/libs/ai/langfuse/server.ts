import { LangfuseClient } from '@langfuse/client'
import { LangfuseSpanProcessor } from '@langfuse/otel'

export function getLangfuseEnvironment(): string {
  console.log('process.env.VERCEL_ENV', process.env.VERCEL_ENV)
  console.log('process.env.DD_ENV', process.env.DD_ENV)
  console.log('process.env.NODE_ENV', process.env.NODE_ENV)
  return (
    process.env.VERCEL_ENV ??
    process.env.DD_ENV ??
    process.env.NODE_ENV ??
    'development'
  )
}

export const langfuseSpanProcessor = new LangfuseSpanProcessor({
  environment: getLangfuseEnvironment()
})
export const langfuse = new LangfuseClient()
