import { useMutation } from '@apollo/client'
import { UpChunk } from '@mux/upchunk'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import {
  ReactElement,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo
} from 'react'

import {
  CREATE_MUX_VIDEO_UPLOAD_BY_FILE_MUTATION,
  GET_MY_MUX_VIDEO_QUERY
} from './graphql'
import type { TemplateVideoUploadContextType, VideoUploadState } from './types'
import { createInitialTask, MAX_VIDEO_SIZE } from './types'
import { useMuxVideoProcessing } from './useMuxVideoProcessing'
import { useUploadTaskMap } from './useUploadTaskMap'

const TemplateVideoUploadContext = createContext<
  TemplateVideoUploadContextType | undefined
>(undefined)

/**
 * Manages background video uploads across card switches in the MediaScreen.
 *
 * Upload state is stored in a Map<videoBlockId, UploadTaskInternal> so that
 * switching cards does not unmount/abort in-flight uploads. The full lifecycle
 * per video block is: UpChunk upload -> Mux polling -> VIDEO_BLOCK_UPDATE
 * mutation -> journey refetch.
 *
 * Placed at the MultiStepForm level; the Next button is disabled while
 * `hasActiveUploads` is true, keeping the user on the MediaScreen.
 */
export function TemplateVideoUploadProvider({
  children
}: {
  children: ReactNode
}): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()

  const {
    uploadTasks,
    setUploadTasks,
    updateTask,
    removeTask,
    getUploadStatus,
    hasActiveUploads,
    uploadInstancesRef,
    activeBlocksRef
  } = useUploadTaskMap()

  const { startPolling } = useMuxVideoProcessing({
    updateTask,
    removeTask,
    activeBlocksRef
  })

  const [createMuxVideoUploadByFile] = useMutation(
    CREATE_MUX_VIDEO_UPLOAD_BY_FILE_MUTATION
  )

  /**
   * Entry point called by VideosSection. Guards against duplicate uploads for
   * the same block and enforces the 1 GB size limit. Creates a Mux upload URL,
   * then streams the file via UpChunk. On UpChunk success, transitions to
   * startPolling; on error, marks the task failed.
   */
  const startUpload = useCallback(
    async (videoBlockId: string, file: File) => {
      if (activeBlocksRef.current.has(videoBlockId)) return

      if (file.size > MAX_VIDEO_SIZE) {
        const message = t('File is too large. Max size is 1GB.')
        enqueueSnackbar(message, { variant: 'error' })
        setUploadTasks((prev) => {
          const next = new Map(prev)
          next.set(videoBlockId, {
            ...createInitialTask(videoBlockId),
            status: 'error',
            error: message
          })
          return next
        })
        return
      }

      activeBlocksRef.current.add(videoBlockId)
      setUploadTasks((prev) => {
        const next = new Map(prev)
        next.set(videoBlockId, createInitialTask(videoBlockId))
        return next
      })

      try {
        const { data, errors } = await createMuxVideoUploadByFile({
          variables: { name: file.name }
        })
        if (errors != null && errors.length > 0) {
          const message = errors[0]?.message ?? 'Upload failed'
          throw new Error(message)
        }

        const uploadUrl = data?.createMuxVideoUploadByFile?.uploadUrl
        const muxVideoId = data?.createMuxVideoUploadByFile?.id

        if (uploadUrl == null || muxVideoId == null) {
          throw new Error('Failed to create upload URL')
        }

        updateTask(videoBlockId, { videoId: muxVideoId })

        const upload = UpChunk.createUpload({
          endpoint: uploadUrl,
          file,
          chunkSize: 5120
        })

        uploadInstancesRef.current.set(videoBlockId, upload)

        upload.on('progress', (progress) => {
          updateTask(videoBlockId, { progress: progress.detail })
        })

        upload.on('success', () => {
          uploadInstancesRef.current.delete(videoBlockId)
          startPolling(videoBlockId, muxVideoId)
        })

        upload.on('error', () => {
          uploadInstancesRef.current.delete(videoBlockId)
          activeBlocksRef.current.delete(videoBlockId)
          enqueueSnackbar(t('Upload failed. Please try again'), {
            variant: 'error'
          })
          updateTask(videoBlockId, {
            status: 'error',
            error: 'Upload failed'
          })
        })
      } catch (err) {
        activeBlocksRef.current.delete(videoBlockId)
        const message = err instanceof Error ? err.message : 'Upload failed'
        enqueueSnackbar(t('Upload failed. Please try again'), {
          variant: 'error'
        })
        updateTask(videoBlockId, {
          status: 'error',
          error: message
        })
      }
    },
    [
      createMuxVideoUploadByFile,
      updateTask,
      startPolling,
      enqueueSnackbar,
      t,
      activeBlocksRef,
      setUploadTasks,
      uploadInstancesRef
    ]
  )

  const value = useMemo<TemplateVideoUploadContextType>(
    () => ({
      startUpload,
      getUploadStatus,
      hasActiveUploads
    }),
    [startUpload, getUploadStatus, hasActiveUploads]
  )

  return (
    <TemplateVideoUploadContext.Provider value={value}>
      {children}
    </TemplateVideoUploadContext.Provider>
  )
}

export function useTemplateVideoUpload(): TemplateVideoUploadContextType {
  const context = useContext(TemplateVideoUploadContext)
  if (context === undefined) {
    throw new Error(
      'useTemplateVideoUpload must be used within a TemplateVideoUploadProvider'
    )
  }
  return context
}

export type { VideoUploadState, VideoUploadStatus } from './types'
export { CREATE_MUX_VIDEO_UPLOAD_BY_FILE_MUTATION, GET_MY_MUX_VIDEO_QUERY } from './graphql'
