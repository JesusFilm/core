import { Dispatch, SetStateAction } from 'react'

import { TASK_CLEANUP_DELAY } from '../constants'
import type { ShowSnackbarOptions } from '../showSnackbar/showSnackbar'
import type { PollingTask } from '../types'

interface HandlePollingErrorDependencies {
  setPollingTasks: Dispatch<SetStateAction<Map<string, PollingTask>>>
  showSnackbar: (
    message: string,
    variant: 'success' | 'error' | 'info' | 'warning',
    options?: boolean | ShowSnackbarOptions
  ) => void
}

export function handlePollingError(
  videoId: string,
  error: string,
  dependencies: HandlePollingErrorDependencies
): void {
  const { setPollingTasks, showSnackbar } = dependencies

  setPollingTasks((prev) => {
    const task = prev.get(videoId)
    if (task == null) return prev

    task.stopPolling()
    const next = new Map(prev)
    next.set(videoId, { ...task, status: 'error' })
    return next
  })

  showSnackbar(error, 'error', {
    autoHideDuration: 4000,
    preventDuplicate: true,
    persist: false
  })

  // Remove from state after notification
  setTimeout(() => {
    setPollingTasks((prev) => {
      const next = new Map(prev)
      next.delete(videoId)
      return next
    })
  }, TASK_CLEANUP_DELAY)
}
