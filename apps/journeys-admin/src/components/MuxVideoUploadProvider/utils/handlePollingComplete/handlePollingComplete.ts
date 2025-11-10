import { Dispatch, SetStateAction } from 'react'

import { TASK_CLEANUP_DELAY } from '../constants'
import type { ShowSnackbarOptions } from '../showSnackbar/showSnackbar'
import type { PollingTask } from '../types'

interface HandlePollingCompleteDependencies {
  pollingTasks: Map<string, PollingTask>
  setPollingTasks: Dispatch<SetStateAction<Map<string, PollingTask>>>
  showSnackbar: (
    message: string,
    variant: 'success' | 'error' | 'info' | 'warning',
    options?: boolean | ShowSnackbarOptions
  ) => void
  t: (key: string) => string
}

export async function handlePollingComplete(
  videoId: string,
  dependencies: HandlePollingCompleteDependencies
): Promise<void> {
  const { pollingTasks, setPollingTasks, showSnackbar, t } = dependencies

  const task = pollingTasks.get(videoId)
  if (task == null) return

  task.stopPolling()

  setPollingTasks((prev) => {
    const next = new Map(prev)
    next.set(videoId, { ...task, status: 'completed' })
    return next
  })

  showSnackbar(t('Video upload completed'), 'success', {
    autoHideDuration: 4000,
    preventDuplicate: true,
    persist: false
  })

  // Call the completion callback after data is ready
  if (task.onComplete != null) {
    task.onComplete()
  }

  // Remove from state after notification
  setTimeout(() => {
    setPollingTasks((prev) => {
      const next = new Map(prev)
      next.delete(videoId)
      return next
    })
  }, TASK_CLEANUP_DELAY)
}
