import { google } from '@ai-sdk/google'

const DEFAULT_MODEL = 'gemini-2.5-flash'
const DEFAULT_FALLBACK_MODEL = 'gemini-2.0-flash'
const DEFAULT_MAX_RETRIES = 3
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

/**
 * Retries `operation` with exponential backoff on 429s.
 *
 * @param shouldAbort - Optional callback checked after each retry delay. If it
 *   returns true the current iteration is skipped and the last 429 is thrown so
 *   the caller can route to a fallback immediately. This lets a concurrent
 *   session call that already switched to fallback short-circuit in-progress
 *   primary retries.
 */
async function retryWithBackoff<T>(
  model: ReturnType<typeof google>,
  operation: (model: ReturnType<typeof google>) => Promise<T>,
  maxRetries: number,
  shouldAbort?: () => boolean
): Promise<T> {
  const clampedMaxRetries = Math.max(0, maxRetries)
  let lastError: unknown
  for (let attempt = 0; attempt <= clampedMaxRetries; attempt++) {
    if (attempt > 0) {
      const delayMs = BACKOFF_BASE_MS * Math.pow(2, attempt - 1)
      await new Promise((resolve) => setTimeout(resolve, delayMs))
      // After sleeping, check whether a concurrent call already switched to
      // fallback. If so, bail early so this call also routes to fallback.
      if (shouldAbort?.()) break
    }
    try {
      return await operation(model)
    } catch (error) {
      if (!isRateLimitError(error)) throw error
      lastError = error
    }
  }
  throw lastError
}

export interface GeminiFallbackSession {
  execute<T>(
    operation: (model: ReturnType<typeof google>) => Promise<T>
  ): Promise<T>
}

/**
 * Creates a session-aware fallback that shares state across calls.
 * Once the primary model exhausts its retries on a 429, ALL subsequent
 * calls in the same session skip the primary and go straight to the fallback.
 *
 * Concurrent calls: if a concurrent `execute()` call flips `useFallback` while
 * another call is sleeping between primary retries, the sleeping call aborts
 * its remaining primary retries and routes to the fallback model immediately.
 */
export function createGeminiFallbackSession(): GeminiFallbackSession {
  const maxRetries = getGeminiMaxRetries()
  const primaryModel = getGeminiModel()
  const fallbackModel = getGeminiFallbackModel()
  let useFallback = false

  return {
    async execute<T>(
      operation: (model: ReturnType<typeof google>) => Promise<T>
    ): Promise<T> {
      if (useFallback) {
        return retryWithBackoff(fallbackModel, operation, maxRetries)
      }

      try {
        return await retryWithBackoff(primaryModel, operation, maxRetries, () => useFallback)
      } catch (error) {
        if (!isRateLimitError(error)) throw error
        // Primary exhausted all retries (or aborted early due to a concurrent
        // call); switch to fallback permanently for this session.
        useFallback = true
        return retryWithBackoff(fallbackModel, operation, maxRetries)
      }
    }
  }
}

/**
 * Stateless fallback helper — thin wrapper around a single-use session.
 * Kept for backward compatibility with callers that don't need cross-call state.
 */
export async function withGeminiFallback<T>(
  operation: (model: ReturnType<typeof google>) => Promise<T>
): Promise<T> {
  return createGeminiFallbackSession().execute(operation)
}
