import { openrouter } from '@openrouter/ai-sdk-provider'

type AIModel = ReturnType<typeof openrouter.chat>

const DEFAULT_MAX_RETRIES = 3
const BACKOFF_BASE_MS = 1000

function getMaxRetries(): number {
  const envValue = process.env.GEMINI_MAX_RETRIES?.trim()
  if (envValue == null || envValue === '') return DEFAULT_MAX_RETRIES
  const parsed = Number(envValue)
  if (!Number.isInteger(parsed) || parsed < 0) return DEFAULT_MAX_RETRIES
  return parsed
}

function getStatusCode(error: unknown): number | undefined {
  if (!(error instanceof Error)) return undefined
  const err = error as unknown as Record<string, unknown>
  if (typeof err.statusCode === 'number') return err.statusCode
  const lastError = err.lastError as Record<string, unknown> | undefined
  if (typeof lastError?.statusCode === 'number') return lastError.statusCode
  return undefined
}

function isRateLimitError(error: unknown): boolean {
  return getStatusCode(error) === 429
}

function isFallbackEligible(error: unknown): boolean {
  const code = getStatusCode(error)
  return code === 429 || code === 403
}

async function retryWithBackoff<T>(
  model: AIModel,
  operation: (model: AIModel) => Promise<T>,
  maxRetries: number,
  shouldAbort?: () => boolean
): Promise<T> {
  const clampedMaxRetries = Math.max(0, maxRetries)
  let lastError: unknown
  for (let attempt = 0; attempt <= clampedMaxRetries; attempt++) {
    if (attempt > 0) {
      const delayMs = BACKOFF_BASE_MS * Math.pow(2, attempt - 1)
      await new Promise((resolve) => setTimeout(resolve, delayMs))
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

export interface OpenrouterFallbackSession {
  execute<T>(operation: (model: AIModel) => Promise<T>): Promise<T>
}

/**
 * Creates a session-aware fallback from a list of model names.
 *
 * Models are tried in order. Once a model exhausts retries on a
 * 429 or returns a 403 (key/quota limit), the next model in the
 * chain is used. Once a model is exhausted, all subsequent calls
 * in the same session skip directly to the current active model.
 */
export function createOpenrouterFallbackSession(
  modelNames: string[]
): OpenrouterFallbackSession {
  const models = modelNames.map((name) => openrouter.chat(name))
  const maxRetries = getMaxRetries()
  let activeModelIndex = 0

  const hasAborted = (snapshot: number): boolean =>
    activeModelIndex !== snapshot

  return {
    async execute<T>(operation: (model: AIModel) => Promise<T>): Promise<T> {
      while (activeModelIndex < models.length) {
        const modelIndex = activeModelIndex

        try {
          return await retryWithBackoff(
            models[modelIndex],
            operation,
            maxRetries,
            () => hasAborted(modelIndex)
          )
        } catch (error) {
          if (!isFallbackEligible(error)) throw error

          if (activeModelIndex < models.length - 1) {
            activeModelIndex = modelIndex + 1
            continue
          }

          throw error
        }
      }

      return retryWithBackoff(models[models.length - 1], operation, maxRetries)
    }
  }
}

/**
 * Stateless fallback helper — thin wrapper around a single-use session.
 */
export async function withOpenrouterFallback<T>(
  operation: (model: AIModel) => Promise<T>,
  modelNames: string[]
): Promise<T> {
  return createOpenrouterFallbackSession(modelNames).execute(operation)
}
