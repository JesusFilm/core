import { Langfuse } from 'langfuse'

let cached: Langfuse | null | undefined
let warned = false

export const APOLOGIST_PROMPT_NAME = 'apologist-world-cup-chat'

export function getLangfuse(): Langfuse | null {
  if (cached !== undefined) return cached

  const publicKey = process.env.LANGFUSE_PUBLIC_KEY
  const secretKey = process.env.LANGFUSE_SECRET_KEY
  const baseUrl = process.env.LANGFUSE_BASE_URL

  if (
    publicKey == null ||
    publicKey === '' ||
    secretKey == null ||
    secretKey === '' ||
    baseUrl == null ||
    baseUrl === ''
  ) {
    if (!warned) {
      console.warn(
        '[langfuse] missing LANGFUSE_PUBLIC_KEY / LANGFUSE_SECRET_KEY / LANGFUSE_BASE_URL — tracing + prompt fetch disabled'
      )
      warned = true
    }
    cached = null
    return cached
  }

  cached = new Langfuse({ publicKey, secretKey, baseUrl })
  return cached
}

export function getActivePromptLabel(): string {
  return process.env.VERCEL_ENV === 'production' ? 'production' : 'development'
}
