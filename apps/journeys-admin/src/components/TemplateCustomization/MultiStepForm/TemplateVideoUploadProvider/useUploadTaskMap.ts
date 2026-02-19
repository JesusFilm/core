import { useCallback, useMemo, useRef, useState } from 'react'

import type {
  UploadTaskInternal,
  VideoUploadState
} from './types'

/**
 * Manages the Map of in-flight upload tasks and exposes CRUD operations.
 *
 * Each task tracks the lifecycle state of one video-block upload.
 * Derived state (`hasActiveUploads`, `getUploadStatus`) is memoised for
 * the provider's context value.
 *
 * Note: `removeTask` does not clear polling timeouts; the caller
 * (useMuxVideoProcessing) must call `clearPollingForBlock` before
 * removeTask when appropriate.
 */
export function useUploadTaskMap(): {
  uploadTasks: Map<string, UploadTaskInternal>
  setUploadTasks: React.Dispatch<React.SetStateAction<Map<string, UploadTaskInternal>>>
  updateTask: (videoBlockId: string, updates: Partial<UploadTaskInternal>) => void
  removeTask: (videoBlockId: string) => void
  getUploadStatus: (videoBlockId: string) => VideoUploadState | null
  hasActiveUploads: boolean
  uploadInstancesRef: React.MutableRefObject<Map<string, { abort: () => void }>>
  activeBlocksRef: React.MutableRefObject<Set<string>>
} {
  const [uploadTasks, setUploadTasks] = useState<Map<string, UploadTaskInternal>>(
    () => new Map()
  )
  const uploadInstancesRef = useRef<Map<string, { abort: () => void }>>(new Map())
  const activeBlocksRef = useRef<Set<string>>(new Set())

  const updateTask = useCallback(
    (videoBlockId: string, updates: Partial<UploadTaskInternal>) => {
      setUploadTasks((prev) => {
        const current = prev.get(videoBlockId)
        if (current == null) return prev
        const next = new Map(prev)
        next.set(videoBlockId, { ...current, ...updates })
        return next
      })
    },
    []
  )

  const removeTask = useCallback((videoBlockId: string) => {
    uploadInstancesRef.current.delete(videoBlockId)
    activeBlocksRef.current.delete(videoBlockId)
    setUploadTasks((prev) => {
      const next = new Map(prev)
      next.delete(videoBlockId)
      return next
    })
  }, [])

  const getUploadStatus = useCallback(
    (videoBlockId: string): VideoUploadState | null => {
      const task = uploadTasks.get(videoBlockId)
      if (task == null) return null
      const { retryCount: _, ...state } = task
      return state
    },
    [uploadTasks]
  )

  const hasActiveUploads = useMemo(() => {
    return Array.from(uploadTasks.values()).some(
      (task) =>
        task.status === 'uploading' ||
        task.status === 'processing' ||
        task.status === 'updating'
    )
  }, [uploadTasks])

  return {
    uploadTasks,
    setUploadTasks,
    updateTask,
    removeTask,
    getUploadStatus,
    hasActiveUploads,
    uploadInstancesRef,
    activeBlocksRef
  }
}
