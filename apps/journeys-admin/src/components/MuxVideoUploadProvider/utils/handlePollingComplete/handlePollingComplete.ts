import { ApolloClient } from '@apollo/client'
import { Dispatch, SetStateAction } from 'react'

import type { PollingTask } from '../types'
import { TASK_CLEANUP_DELAY } from '../constants'

interface HandlePollingCompleteDependencies {
  pollingTasks: Map<string, PollingTask>
  setPollingTasks: Dispatch<SetStateAction<Map<string, PollingTask>>>
  apolloClient: ApolloClient<unknown>
  showSnackbar: (
    message: string,
    variant: 'success' | 'error' | 'info' | 'warning',
    persist?: boolean
  ) => void
  t: (key: string) => string
}

export async function handlePollingComplete(
  videoId: string,
  dependencies: HandlePollingCompleteDependencies
): Promise<void> {
  const { pollingTasks, setPollingTasks, apolloClient, showSnackbar, t } =
    dependencies

  const task = pollingTasks.get(videoId)
  if (task == null) return

  task.stopPolling()

  setPollingTasks((prev) => {
    const next = new Map(prev)
    next.set(videoId, { ...task, status: 'completed' })
    return next
  })

  // Wait for refetch to complete to ensure data is in cache
  await apolloClient.refetchQueries({
    include: 'active'
  })

  showSnackbar(t('Video upload completed'), 'success', true)

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

