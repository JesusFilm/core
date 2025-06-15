import { LangfuseWeb } from 'langfuse'

export const langfuseWeb = new LangfuseWeb({
  publicKey: process.env.NEXT_PUBLIC_LANGFUSE_PUBLIC_KEY ?? '',
  baseUrl: process.env.NEXT_PUBLIC_LANGFUSE_BASE_URL ?? ''
})
