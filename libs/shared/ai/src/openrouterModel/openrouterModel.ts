import { openrouter } from '@openrouter/ai-sdk-provider'

type AIModel = ReturnType<typeof openrouter.chat>

/**
 * An AI operation receives the resolved model and an {@link AbortSignal}.
 *
 * Operations should forward the signal to the underlying AI SDK call
 * (e.g. `generateText({ abortSignal })`) so a hung request can be
 * cancelled when the per-request timeout elapses. Operations that ignore
 * the signal still run, but will not be cancellable on timeout.
 */
type AIOperation<T> = (model: AIModel, abortSignal: AbortSignal) => Promise<T>

const DEFAULT_MAX_RETRIES = 3
const BACKOFF_BASE_MS = 1000
const DEFAULT_REQUEST_TIMEOUT_MS = 60_000

/**
 * Thrown when an AI operation does not settle within the configured timeout.
 *
 * Treated as fallback-eligible so a hung provider triggers the next model in
 * the chain rather than parking the caller forever.
 */
export class AiRequestTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`AI request timed out after ${timeoutMs}ms`)
    this.name = 'AiRequestTimeoutError'
  }
}

function getMaxRetries(): number {
  const envValue = process.env.GEMINI_MAX_RETRIES?.trim()
  if (envValue == null || envValue === '') return DEFAULT_MAX_RETRIES
  const parsed = Number(envValue)
  if (!Number.isInteger(parsed) || parsed < 0) return DEFAULT_MAX_RETRIES
  return parsed
}

function getRequestTimeoutMs(): number {
  const envValue = process.env.AI_REQUEST_TIMEOUT_MS?.trim()
  if (envValue == null || envValue === '') return DEFAULT_REQUEST_TIMEOUT_MS
  const parsed = Number(envValue)
  if (!Number.isInteger(parsed) || parsed < 0) return DEFAULT_REQUEST_TIMEOUT_MS
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

function isTimeoutError(error: unknown): boolean {
  return error instanceof AiRequestTimeoutError
}

function isFallbackEligible(error: unknown): boolean {
  if (isTimeoutError(error)) return true
  const code = getStatusCode(error)
  return code === 429 || code === 403
}

/**
 * Runs a single operation attempt, aborting it if it does not settle within
 * `timeoutMs`. A timed-out attempt rejects with {@link AiRequestTimeoutError}
 * regardless of how the underlying SDK surfaces the abort.
 */
async function runWithTimeout<T>(
  model: AIModel,
  operation: AIOperation<T>,
  timeoutMs: number
): Promise<T> {
  const controller = new AbortController()
  if (timeoutMs <= 0) return operation(model, controller.signal)

  const timer = setTimeout(() => {
    controller.abort(new AiRequestTimeoutError(timeoutMs))
  }, timeoutMs)

  try {
    return await operation(model, controller.signal)
  } catch (error) {
    if (controller.signal.aborted) throw new AiRequestTimeoutError(timeoutMs)
    throw error
  } finally {
    clearTimeout(timer)
  }
}

async function retryWithBackoff<T>(
  model: AIModel,
  operation: AIOperation<T>,
  maxRetries: number,
  timeoutMs: number,
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
      return await runWithTimeout(model, operation, timeoutMs)
    } catch (error) {
      if (!isRateLimitError(error)) throw error
      lastError = error
    }
  }
  throw lastError
}

export interface OpenrouterFallbackSession {
  execute<T>(operation: AIOperation<T>): Promise<T>
}

/**
 * Creates a session-aware fallback from a list of model names.
 *
 * Models are tried in order. Once a model exhausts retries on a
 * 429, returns a 403 (key/quota limit), or times out, the next model
 * in the chain is used. Once a model is exhausted, all subsequent calls
 * in the same session skip directly to the current active model.
 *
 * Each attempt is bounded by a per-request timeout (`AI_REQUEST_TIMEOUT_MS`,
 * default 60s) so a hung provider request rejects instead of hanging forever.
 */
export function createOpenrouterFallbackSession(
  modelNames: string[]
): OpenrouterFallbackSession {
  const models = modelNames.map((name) => openrouter.chat(name))
  const maxRetries = getMaxRetries()
  const timeoutMs = getRequestTimeoutMs()
  let activeModelIndex = 0

  const hasAborted = (snapshot: number): boolean =>
    activeModelIndex !== snapshot

  return {
    async execute<T>(operation: AIOperation<T>): Promise<T> {
      while (activeModelIndex < models.length) {
        const modelIndex = activeModelIndex

        try {
          return await retryWithBackoff(
            models[modelIndex],
            operation,
            maxRetries,
            timeoutMs,
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

      return retryWithBackoff(
        models[models.length - 1],
        operation,
        maxRetries,
        timeoutMs
      )
    }
  }
}

/**
 * Stateless fallback helper — thin wrapper around a single-use session.
 */
export async function withOpenrouterFallback<T>(
  operation: AIOperation<T>,
  modelNames: string[]
): Promise<T> {
  return createOpenrouterFallbackSession(modelNames).execute(operation)
}
