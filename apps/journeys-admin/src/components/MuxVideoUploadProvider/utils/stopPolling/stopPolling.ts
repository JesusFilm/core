import { Dispatch, MutableRefObject, SetStateAction } from 'react'

import type { PollingTask } from '../types'

interface StopPollingDependencies {
  setPollingTasks: Dispatch<SetStateAction<Map<string, PollingTask>>>
  stopQueryRefs: MutableRefObject<Map<string, () => void>>
  hasShownStartNotification: MutableRefObject<Set<string>>
}

export function stopPolling(
  videoId: string,
  dependencies: StopPollingDependencies
): void {
  const { setPollingTasks, stopQueryRefs, hasShownStartNotification } =
    dependencies

  setPollingTasks((prev) => {
    const task = prev.get(videoId)
    if (task == null) return prev

    task.stopPolling()
    const next = new Map(prev)
    next.delete(videoId)
    return next
  })
  stopQueryRefs.current.delete(videoId)
  hasShownStartNotification.current.delete(videoId)
}
