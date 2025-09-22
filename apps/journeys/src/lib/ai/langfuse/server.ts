import { LangfuseClient } from '@langfuse/client'

export const langfuseEnvironment = "nes830"
  // process.env.VERCEL_ENV ??
  // process.env.DD_ENV ??
  // process.env.NODE_ENV ??
  // 'development'

export const langfuseClient = new LangfuseClient()
