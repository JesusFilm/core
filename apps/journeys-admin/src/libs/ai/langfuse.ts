import { Langfuse } from 'langfuse'

export const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY ?? '',
  secretKey: process.env.LANGFUSE_SECRET_KEY ?? '',
  baseUrl: process.env.LANGFUSE_BASE_URL
})
