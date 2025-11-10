import { Dispatch, RefObject, SetStateAction } from 'react'

import { TASK_CLEANUP_DELAY } from '../constants'
import type { UploadTask } from '../types'

interface CleanupUploadTaskDependencies {
  setUploadTasks: Dispatch<SetStateAction<Map<string, UploadTask>>>
  uploadInstanceRefs: RefObject<Map<string, { abort: () => void }>>
}

export function cleanupUploadTask(
  videoBlockId: string,
  dependencies: CleanupUploadTaskDependencies
): void {
  const { setUploadTasks, uploadInstanceRefs } = dependencies

  uploadInstanceRefs.current.delete(videoBlockId)

  setTimeout(() => {
    setUploadTasks((prev) => {
      const next = new Map(prev)
      next.delete(videoBlockId)
      return next
    })
  }, TASK_CLEANUP_DELAY)
}
