import { Dispatch, SetStateAction } from 'react'

import type { UploadTask } from '../types'

interface AddUploadToQueueDependencies {
  setUploadTasks: Dispatch<SetStateAction<Map<string, UploadTask>>>
}

export function addUploadToQueue(
  videoBlockId: string,
  file: File,
  languageCode: string | undefined,
  languageName: string | undefined,
  onComplete: ((videoId: string) => void) | undefined,
  dependencies: AddUploadToQueueDependencies
): void {
  const { setUploadTasks } = dependencies

  setUploadTasks((prev) => {
    const next = new Map(prev)
    next.set(videoBlockId, {
      videoBlockId,
      file,
      languageCode,
      languageName,
      status: 'waiting',
      progress: 0,
      onComplete
    })
    return next
  })
}

