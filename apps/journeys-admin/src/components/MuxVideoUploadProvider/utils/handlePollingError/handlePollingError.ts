import { Dispatch, RefObject, SetStateAction } from 'react'

import { clearPollingInterval } from '../clearPollingInterval'
import { TASK_CLEANUP_DELAY } from '../constants'
import type { PollingTask } from '../types'

interface HandlePollingErrorDependencies {
  setPollingTasks: Dispatch<SetStateAction<Map<string, PollingTask>>>
  showSnackbar: (
    message: string,
    variant: 'success' | 'error' | 'info' | 'warning',
    persist?: boolean
  ) => void
  pollingIntervalsRef: RefObject<Map<string, NodeJS.Timeout>>
}

export function handlePollingError(
  videoId: string,
  error: string,
  dependencies: HandlePollingErrorDependencies
): void {
  const { setPollingTasks, showSnackbar, pollingIntervalsRef } = dependencies

  clearPollingInterval(videoId, pollingIntervalsRef)

  setPollingTasks((prev) => {
    const task = prev.get(videoId)
    if (task == null) return prev
    const next = new Map(prev)
    next.set(videoId, { ...task, status: 'error' })
    return next
  })

  showSnackbar(error, 'error', true)

  // Remove from state after notification
  setTimeout(() => {
    setPollingTasks((prev) => {
      const next = new Map(prev)
      next.delete(videoId)
      return next
    })
  }, TASK_CLEANUP_DELAY)
}
