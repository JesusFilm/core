import { UpChunk } from '@mux/upchunk'
import { Dispatch, RefObject, SetStateAction } from 'react'

import { CreateMuxVideoUploadByFileMutation } from '../../../../../__generated__/CreateMuxVideoUploadByFileMutation'
import type { UploadTask } from '../types'

import { cleanupUploadTask } from './cleanupUploadTask'

interface ProcessUploadDependencies {
  setUploadTasks: Dispatch<SetStateAction<Map<string, UploadTask>>>
  createMuxVideoUploadByFile: (options: {
    variables: {
      name: string
      generateSubtitlesInput?:
        | { languageCode: string; languageName: string }
        | undefined
    }
  }) => Promise<{
    data?: CreateMuxVideoUploadByFileMutation | null
  }>
  startPolling: (
    videoId: string,
    languageCode?: string,
    onComplete?: () => void
  ) => void
  uploadInstanceRefs: RefObject<Map<string, { abort: () => void }>>
}

export async function processUpload(
  videoBlockId: string,
  task: UploadTask,
  dependencies: ProcessUploadDependencies
): Promise<void> {
  const {
    setUploadTasks,
    createMuxVideoUploadByFile,
    startPolling,
    uploadInstanceRefs
  } = dependencies

  try {
    // Update status to uploading
    setUploadTasks((prev) => {
      const next = new Map(prev)
      next.set(videoBlockId, {
        ...task,
        status: 'uploading',
        progress: 0
      })
      return next
    })

    // Create upload mutation
    const fileName = task.file.name.split('.')[0]
    const { data } = await createMuxVideoUploadByFile({
      variables: {
        name: fileName,
        generateSubtitlesInput:
          task.languageCode != null && task.languageName != null
            ? {
                languageCode: task.languageCode,
                languageName: task.languageName
              }
            : undefined
      }
    })

    if (
      data?.createMuxVideoUploadByFile?.uploadUrl == null ||
      data?.createMuxVideoUploadByFile?.id == null
    ) {
      throw new Error('Failed to create upload URL')
    }

    const videoId = data.createMuxVideoUploadByFile.id

    // Update task with videoId
    setUploadTasks((prev) => {
      const next = new Map(prev)
      next.set(videoBlockId, {
        ...prev.get(videoBlockId)!,
        videoId
      })
      return next
    })

    // Start upload with UpChunk
    const upload = UpChunk.createUpload({
      file: task.file,
      endpoint: data.createMuxVideoUploadByFile.uploadUrl,
      chunkSize: 5120
    })

    // Store upload instance in map for this videoBlockId
    uploadInstanceRefs.current.set(videoBlockId, upload)

    upload.on('success', (): void => {
      // Update to processing state and start polling
      setUploadTasks((prev) => {
        const next = new Map(prev)
        next.set(videoBlockId, {
          ...prev.get(videoBlockId)!,
          status: 'processing',
          progress: 0
        })
        return next
      })

      // Remove upload instance from map
      uploadInstanceRefs.current.delete(videoBlockId)

      startPolling(videoId, task.languageCode, () => {
        // Update task to completed
        setUploadTasks((prev) => {
          const next = new Map(prev)
          const completedTask = prev.get(videoBlockId)
          if (completedTask != null) {
            next.set(videoBlockId, {
              ...completedTask,
              status: 'completed'
            })
            if (completedTask.onComplete != null) {
              completedTask.onComplete(videoId)
            }
          }
          return next
        })

        cleanupUploadTask(videoBlockId, { setUploadTasks, uploadInstanceRefs })
      })
    })

    upload.on('error', (err): void => {
      setUploadTasks((prev) => {
        const next = new Map(prev)
        next.set(videoBlockId, {
          ...prev.get(videoBlockId)!,
          status: 'error',
          error: err.detail
        })
        return next
      })

      cleanupUploadTask(videoBlockId, { setUploadTasks, uploadInstanceRefs })
    })

    upload.on('progress', (progress): void => {
      setUploadTasks((prev) => {
        const next = new Map(prev)
        const currentTask = prev.get(videoBlockId)
        if (currentTask != null) {
          next.set(videoBlockId, {
            ...currentTask,
            progress: progress.detail
          })
        }
        return next
      })
    })
  } catch (error) {
    setUploadTasks((prev) => {
      const next = new Map(prev)
      next.set(videoBlockId, {
        ...task,
        status: 'error',
        error: error instanceof Error ? error : new Error('Upload failed')
      })
      return next
    })

    cleanupUploadTask(videoBlockId, { setUploadTasks, uploadInstanceRefs })
  }
}
