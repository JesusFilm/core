import { Dispatch, RefObject, SetStateAction } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'

import { findBlocksByTypename } from '../../../../libs/findBlocksByTypename'
import { clearPollingInterval } from '../clearPollingInterval'
import type { PollingTask, UploadTask } from '../types'

interface CancelUploadForBlockDependencies {
  uploadTasks: Map<string, UploadTask>
  setUploadTasks: Dispatch<SetStateAction<Map<string, UploadTask>>>
  setPollingTasks: Dispatch<SetStateAction<Map<string, PollingTask>>>
  uploadInstanceRefs: RefObject<Map<string, { abort: () => void }>>
  pollingIntervalsRef: RefObject<Map<string, NodeJS.Timeout>>
  hasShownStartNotification: RefObject<Set<string>>
}

function cancelUploadForVideoBlockId(
  videoBlockId: string,
  dependencies: CancelUploadForBlockDependencies
): void {
  const {
    uploadTasks,
    setUploadTasks,
    setPollingTasks,
    uploadInstanceRefs,
    pollingIntervalsRef,
    hasShownStartNotification
  } = dependencies

  const task = uploadTasks.get(videoBlockId)
  if (task == null) return

  // If currently uploading, abort the upload
  const uploadInstance = uploadInstanceRefs.current.get(videoBlockId)
  if (uploadInstance != null) {
    uploadInstance.abort()
    uploadInstanceRefs.current.delete(videoBlockId)
  }

  // If task has a videoId, stop polling (polling may have started after upload completed)
  if (task.videoId != null) {
    clearPollingInterval(task.videoId, pollingIntervalsRef)
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
    next.delete(videoBlockId)
    return next
  })
}

export function cancelUploadForBlock(
  block: TreeBlock,
  dependencies: CancelUploadForBlockDependencies
): void {
  if (block.__typename === 'VideoBlock') {
    cancelUploadForVideoBlockId(block.id, dependencies)
  } else if (block.__typename === 'StepBlock') {
    const videoBlocks = findBlocksByTypename(block, 'VideoBlock')
    for (const videoBlock of videoBlocks) {
      cancelUploadForVideoBlockId(videoBlock.id, dependencies)
    }
  }
}
