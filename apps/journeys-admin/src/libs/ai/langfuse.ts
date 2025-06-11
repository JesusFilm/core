import { Langfuse } from 'langfuse'

export const langfuse = new Langfuse({
  publicKey: process.env.NEXT_PUBLIC_LANGFUSE_PUBLIC_KEY ?? '',
  secretKey: process.env.LANGFUSE_SECRET_KEY ?? '',
  baseUrl: process.env.LANGFUSE_BASE_URL,
  environment:
    process.env.VERCEL_ENV ??
    process.env.DD_ENV ??
    process.env.NODE_ENV ??
    'development'
})
