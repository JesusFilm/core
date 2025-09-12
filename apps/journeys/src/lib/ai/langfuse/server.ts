import { LangfuseClient } from '@langfuse/client'

export const langfuseEnvironment =
  process.env.VERCEL_ENV ??
  process.env.DD_ENV ??
  process.env.NODE_ENV ??
  'development'

export const langfuseClient = new LangfuseClient({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.LANGFUSE_BASE_URL,
})
