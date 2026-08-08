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
    lastAttemptAt: new Date().toISOString()
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
      Math.max(1, previousAttempts(processingStages, 'parentSync'))
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
        failedStageValue != null ? retryAtFor(failedStageValue.attempts) : null,
      errorMessage: failedStageValue?.error ?? null
    }
  })
}
