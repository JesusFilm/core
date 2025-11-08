import { UpChunk } from '@mux/upchunk'
import { Dispatch, MutableRefObject, SetStateAction } from 'react'

import { CreateMuxVideoUploadByFileMutation } from '../../../../../__generated__/CreateMuxVideoUploadByFileMutation'
import { TASK_CLEANUP_DELAY } from '../constants'
import type { UploadTask } from '../types'

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
  setCurrentlyUploading: Dispatch<SetStateAction<string | null>>
  startPolling: (
    videoId: string,
    languageCode?: string,
    onComplete?: () => void
  ) => void
  uploadInstanceRef: MutableRefObject<{ abort: () => void } | null>
}

export async function processUpload(
  videoBlockId: string,
  task: UploadTask,
  dependencies: ProcessUploadDependencies
): Promise<void> {
  const {
    setUploadTasks,
    createMuxVideoUploadByFile,
    setCurrentlyUploading,
    startPolling,
    uploadInstanceRef
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

    uploadInstanceRef.current = upload

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

      setCurrentlyUploading(null)

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

        // Cleanup after delay
        setTimeout(() => {
          setUploadTasks((prev) => {
            const next = new Map(prev)
            next.delete(videoBlockId)
            return next
          })
        }, TASK_CLEANUP_DELAY)
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

      setCurrentlyUploading(null)

      // Cleanup after delay
      setTimeout(() => {
        setUploadTasks((prev) => {
          const next = new Map(prev)
          next.delete(videoBlockId)
          return next
        })
      }, TASK_CLEANUP_DELAY)
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

    setCurrentlyUploading(null)

    // Cleanup after delay
    setTimeout(() => {
      setUploadTasks((prev) => {
        const next = new Map(prev)
        next.delete(videoBlockId)
        return next
      })
    }, TASK_CLEANUP_DELAY)
  }
}
