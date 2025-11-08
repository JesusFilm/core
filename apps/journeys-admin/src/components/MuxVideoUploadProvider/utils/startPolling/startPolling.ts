import { Dispatch, MutableRefObject, SetStateAction } from 'react'

import type { PollingTask } from '../types'

interface StartPollingDependencies {
  hasShownStartNotification: MutableRefObject<Set<string>>
  showSnackbar: (
    message: string,
    variant: 'success' | 'error' | 'info' | 'warning',
    persist?: boolean
  ) => void
  t: (key: string) => string
  setPollingTasks: Dispatch<SetStateAction<Map<string, PollingTask>>>
  stopQueryRefs: MutableRefObject<Map<string, () => void>>
}

export function startPolling(
  videoId: string,
  languageCode: string | undefined,
  onComplete: (() => void) | undefined,
  dependencies: StartPollingDependencies
): void {
  const {
    hasShownStartNotification,
    showSnackbar,
    t,
    setPollingTasks,
    stopQueryRefs
  } = dependencies

  // Show start notification only once per video
  if (!hasShownStartNotification.current.has(videoId)) {
    showSnackbar(t('Video upload in progress'), 'success', true)
    hasShownStartNotification.current.add(videoId)
  }

  const startTime = Date.now()

  // Create task entry immediately with callback
  setPollingTasks((prev) => {
    const next = new Map(prev)
    next.set(videoId, {
      videoId,
      languageCode,
      status: 'processing',
      startTime,
      onComplete,
      stopPolling: () => {
        // Reference the stopQuery function from the ref map
        stopQueryRefs.current.get(videoId)?.()
      }
    })
    return next
  })
}
