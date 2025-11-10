import { Dispatch, RefObject, SetStateAction } from 'react'

import type { PollingTask } from '../types'

interface StartPollingServices {
  hasShownStartNotification: RefObject<Set<string>>
  showSnackbar: (
    message: string,
    variant: 'success' | 'error' | 'info' | 'warning',
    persist?: boolean
  ) => void
  t: (key: string) => string
  setPollingTasks: Dispatch<SetStateAction<Map<string, PollingTask>>>
}

export function startPolling(
  videoId: string,
  languageCode: string | undefined,
  onComplete: (() => void) | undefined,
  services: StartPollingServices
): void {
  const { hasShownStartNotification, showSnackbar, t, setPollingTasks } =
    services

  // Show start notification only once per video
  if (!hasShownStartNotification.current.has(videoId)) {
    showSnackbar(t('Video upload in progress'), 'success', true)
    hasShownStartNotification.current.add(videoId)
  }

  const startTime = Date.now()

  // Create task entry immediately
  setPollingTasks((prev) => {
    const next = new Map(prev)
    next.set(videoId, {
      videoId,
      languageCode,
      status: 'processing',
      startTime,
      onComplete
    })
    return next
  })
}
