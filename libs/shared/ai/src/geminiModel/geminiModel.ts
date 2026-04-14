import { google } from '@ai-sdk/google'

const DEFAULT_MODEL = 'gemini-2.5-flash'
const DEFAULT_FALLBACK_MODEL = 'gemini-2.0-flash'
const DEFAULT_MAX_RETRIES = 4
const BACKOFF_BASE_MS = 1000

export function getGeminiModel() {
  const model = process.env.GEMINI_MODEL?.trim()
  return google(model || DEFAULT_MODEL)
}

export function getGeminiFallbackModel() {
  const fallback = process.env.GEMINI_FALLBACK_MODEL?.trim()
  return google(fallback || DEFAULT_FALLBACK_MODEL)
}

export function getGeminiMaxRetries(): number {
  const envValue = process.env.GEMINI_MAX_RETRIES?.trim()
  if (envValue == null || envValue === '') return DEFAULT_MAX_RETRIES
  const parsed = Number(envValue)
  if (!Number.isInteger(parsed) || parsed < 0) return DEFAULT_MAX_RETRIES
  return parsed
}

export function isRateLimitError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const err = error as unknown as Record<string, unknown>
  if (err.statusCode === 429) return true
  const lastError = err.lastError as Record<string, unknown> | undefined
  return lastError?.statusCode === 429
}

export async function withGeminiFallback<T>(
  operation: (model: ReturnType<typeof google>) => Promise<T>
): Promise<T> {
  try {
    return await operation(getGeminiModel())
  } catch (error) {
    if (!isRateLimitError(error)) throw error
    const delayMs = BACKOFF_BASE_MS * (1 + Math.random())
    await new Promise((resolve) => setTimeout(resolve, delayMs))
    return operation(getGeminiFallbackModel())
  }
}
