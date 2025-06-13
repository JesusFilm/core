import { Langfuse } from 'langfuse'
import { LangfuseExporter } from 'langfuse-vercel'

export const langfuseEnvironment =
  process.env.VERCEL_ENV ??
  process.env.DD_ENV ??
  process.env.NODE_ENV ??
  'development'

export const langfuseExporter = new LangfuseExporter({
  publicKey: process.env.NEXT_PUBLIC_LANGFUSE_PUBLIC_KEY ?? '',
  secretKey: process.env.LANGFUSE_SECRET_KEY ?? '',
  baseUrl: process.env.NEXT_PUBLIC_LANGFUSE_BASE_URL,
  environment: langfuseEnvironment
})

export const langfuse = new Langfuse({
  publicKey: process.env.NEXT_PUBLIC_LANGFUSE_PUBLIC_KEY ?? '',
  secretKey: process.env.LANGFUSE_SECRET_KEY ?? '',
  baseUrl: process.env.NEXT_PUBLIC_LANGFUSE_BASE_URL,
  environment: langfuseEnvironment
})
