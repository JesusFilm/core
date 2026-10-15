import { updateVideoInAlgolia } from '../../lib/algolia/algoliaVideoUpdate'

export type ProcessingStage = {
  state:
    | 'pending'
    | 'processing'
    | 'complete'
    | 'failed'
    | 'unknown'
    | 'notApplicable'
  attempts: number
  error?: string
  lastAttemptAt?: string
  lastSuccessAt?: string
  // Set (to false) only when the failure will recur on every retry.
  retryable?: boolean
}

export type ProcessingStages = {
  mux: ProcessingStage
  parentSync: ProcessingStage
  downloads: ProcessingStage
  algoliaVideo: ProcessingStage
  algoliaVariant: ProcessingStage
}

export type ReconciliationStatus =
  | 'processing'
  | 'complete'
  | 'degraded'
  | 'failed'

export type ReconciliationStore = {
  videoVariantReconciliation: {
    update: (args: {
      where: { id: string }
      data: {
        status: ReconciliationStatus
        processingStages: ProcessingStages
        retryAt: Date | null
        errorMessage: string | null
      }
    }) => Promise<unknown>
  }
}

export function completedStage(attempts = 1): ProcessingStage {
  const timestamp = new Date().toISOString()
  return {
    state: 'complete',
    attempts,
    lastAttemptAt: timestamp,
    lastSuccessAt: timestamp
  }
}

export function failedStage(error: unknown, attempts = 1): ProcessingStage {
  return {
    state: 'failed',
    attempts,
    error: error instanceof Error ? error.message : String(error),
    lastAttemptAt: new Date().toISOString(),
    ...(isRetryableError(error) ? {} : { retryable: false })
  }
}

// Algolia's ApiError carries the HTTP status. A 4xx other than a timeout or
// rate limit means the request itself was rejected (e.g. a record over the
// size limit), so retrying the same payload can only fail again.
export function isRetryableError(error: unknown): boolean {
  if (error == null || typeof error !== 'object' || !('status' in error)) {
    return true
  }
  const { status } = error
  if (typeof status !== 'number') return true
  return status < 400 || status >= 500 || status === 408 || status === 429
}

// The Video record lives in the videos index (Arclight search), not the
// variants index Watch reads, so a failure here is recorded and retried but
// never stops the Variant's own record from being written.
//
// `stage` is a single slot shared across every Video record synced during
// one reconciliation run (a parent container, then the child's own Video).
// Each call still syncs its own videoId regardless, but once a failure is
// recorded in this run a later call's success must not erase it -- doing so
// would mask a permanently-failing index from ever being retried.
export async function syncVideoRecordStage(
  videoId: string,
  stage: ProcessingStage
): Promise<ProcessingStage> {
  const alreadyFailedThisRun = stage.state === 'failed'
  try {
    await updateVideoInAlgolia(videoId)
    return alreadyFailedThisRun ? stage : completedStage(stage.attempts + 1)
  } catch (error) {
    return failedStage(error, stage.attempts + 1)
  }
}

export function notApplicableStage(): ProcessingStage {
  return { state: 'notApplicable', attempts: 0 }
}

export function generatedParentStages(
  processingStages: unknown = {}
): ProcessingStages {
  return {
    mux: notApplicableStage(),
    parentSync: completedStage(
      previousAttempts(processingStages, 'parentSync') + 1
    ),
    downloads: notApplicableStage(),
    algoliaVideo: {
      state: 'pending',
      attempts: previousAttempts(processingStages, 'algoliaVideo')
    },
    algoliaVariant: {
      state: 'pending',
      attempts: previousAttempts(processingStages, 'algoliaVariant')
    }
  }
}

export function previousAttempts(
  processingStages: unknown,
  stage: string
): number {
  if (
    processingStages == null ||
    typeof processingStages !== 'object' ||
    !(stage in processingStages)
  ) {
    return 0
  }
  const value = (processingStages as Record<string, unknown>)[stage]
  if (value == null || typeof value !== 'object') return 0
  const attempts = (value as Record<string, unknown>).attempts
  return typeof attempts === 'number' ? attempts : 0
}

export function retryAtFor(attempts: number): Date | null {
  if (attempts >= 5) return null
  const delayMinutes = 2 ** Math.max(0, attempts - 1)
  return new Date(Date.now() + delayMinutes * 60_000)
}

export async function persistReconciliationStatus({
  store,
  reconciliationId,
  status,
  stages,
  failedStageValue
}: {
  store: ReconciliationStore
  reconciliationId: string
  status: ReconciliationStatus
  stages: ProcessingStages
  failedStageValue?: ProcessingStage
}): Promise<void> {
  await store.videoVariantReconciliation.update({
    where: { id: reconciliationId },
    data: {
      status,
      processingStages: stages,
      retryAt:
        failedStageValue != null && failedStageValue.retryable !== false
          ? retryAtFor(failedStageValue.attempts)
          : null,
      errorMessage: failedStageValue?.error ?? null
    }
  })
}
