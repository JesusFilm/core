import { Dispatch, RefObject, SetStateAction } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'

import type { PollingTask, UploadTask } from '../types'

interface CancelUploadForBlockDependencies {
  uploadTasks: Map<string, UploadTask>
  setUploadTasks: Dispatch<SetStateAction<Map<string, UploadTask>>>
  setPollingTasks: Dispatch<SetStateAction<Map<string, PollingTask>>>
  uploadInstanceRefs: RefObject<Map<string, { abort: () => void }>>
  stopPollingFnsRef: RefObject<Map<string, () => void>>
  hasShownStartNotification: RefObject<Set<string>>
}

export function cancelUploadForBlock(
  block: TreeBlock,
  dependencies: CancelUploadForBlockDependencies
): void {
  const {
    uploadTasks,
    setUploadTasks,
    setPollingTasks,
    uploadInstanceRefs,
    stopPollingFnsRef,
    hasShownStartNotification
  } = dependencies

  const task = uploadTasks.get(block.id)
  if (task == null) return

  // If currently uploading, abort the upload
  const uploadInstance = uploadInstanceRefs.current.get(block.id)
  if (uploadInstance != null) {
    uploadInstance.abort()
    uploadInstanceRefs.current.delete(block.id)
  }

  // If task has a videoId, stop polling
  if (task.videoId != null) {
    const stopFn = stopPollingFnsRef.current.get(task.videoId)
    if (stopFn != null) {
      stopFn()
    }
    stopPollingFnsRef.current.delete(task.videoId)
    setPollingTasks((prev) => {
      const next = new Map(prev)
      next.delete(task.videoId!)
      return next
    })
    hasShownStartNotification.current.delete(task.videoId)
  }

  // Remove task from upload tasks
  setUploadTasks((prev) => {
    const next = new Map(prev)
    next.delete(block.id)
    return next
  })
}
