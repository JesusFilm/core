import { gql, useLazyQuery, useMutation } from '@apollo/client'
import { UpChunk } from '@mux/upchunk'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import {
  ReactElement,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState
} from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { GET_JOURNEY } from '@core/journeys/ui/useJourneyQuery'

import {
  IdType,
  VideoBlockSource
} from '../../../../../__generated__/globalTypes'
import { VIDEO_BLOCK_UPDATE } from '../../../Editor/Slider/Settings/CanvasDetails/Properties/blocks/Video/Options/VideoOptions'

export const CREATE_MUX_VIDEO_UPLOAD_BY_FILE_MUTATION = gql`
  mutation TemplateVideoUploadCreateMuxVideoUploadByFileMutation(
    $name: String!
  ) {
    createMuxVideoUploadByFile(name: $name) {
      uploadUrl
      id
    }
  }
`

export const GET_MY_MUX_VIDEO_QUERY = gql`
  query TemplateVideoUploadGetMyMuxVideoQuery($id: ID!) {
    getMyMuxVideo(id: $id) {
      id
      assetId
      playbackId
      readyToStream
    }
  }
`

const INITIAL_POLL_INTERVAL = 2000
const MAX_POLL_INTERVAL = 30000
const MAX_RETRIES = 3
const MAX_VIDEO_SIZE = 1073741824 // 1GB

export type VideoUploadStatus =
  | 'uploading'
  | 'processing'
  | 'updating'
  | 'completed'
  | 'error'

export interface VideoUploadState {
  status: VideoUploadStatus
  progress: number
  error?: string
  videoId?: string
}

interface TemplateVideoUploadContextType {
  startUpload: (videoBlockId: string, file: File) => void
  getUploadStatus: (videoBlockId: string) => VideoUploadState | null
  hasActiveUploads: boolean
}

const TemplateVideoUploadContext = createContext<
  TemplateVideoUploadContextType | undefined
>(undefined)

interface UploadTaskInternal extends VideoUploadState {
  videoBlockId: string
  retryCount: number
}

function createInitialTask(videoBlockId: string): UploadTaskInternal {
  return {
    videoBlockId,
    status: 'uploading',
    progress: 0,
    retryCount: 0
  }
}

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
  const { journey } = useJourney()

  const [uploadTasks, setUploadTasks] = useState<
    Map<string, UploadTaskInternal>
  >(new Map())
  const uploadInstancesRef = useRef<Map<string, { abort: () => void }>>(
    new Map()
  )
  const pollingTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const retryCountRef = useRef<Map<string, number>>(new Map())
  const activeBlocksRef = useRef<Set<string>>(new Set())

  const [createMuxVideoUploadByFile] = useMutation(
    CREATE_MUX_VIDEO_UPLOAD_BY_FILE_MUTATION
  )
  const [getMyMuxVideo] = useLazyQuery(GET_MY_MUX_VIDEO_QUERY, {
    fetchPolicy: 'network-only'
  })
  const [videoBlockUpdate] = useMutation(VIDEO_BLOCK_UPDATE)

  const clearPollingForBlock = useCallback((videoBlockId: string) => {
    const timeout = pollingTimeoutsRef.current.get(videoBlockId)
    if (timeout != null) {
      clearTimeout(timeout)
      pollingTimeoutsRef.current.delete(videoBlockId)
    }
    retryCountRef.current.delete(videoBlockId)
  }, [])

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

  const removeTask = useCallback(
    (videoBlockId: string) => {
      clearPollingForBlock(videoBlockId)
      uploadInstancesRef.current.delete(videoBlockId)
      activeBlocksRef.current.delete(videoBlockId)
      setUploadTasks((prev) => {
        const next = new Map(prev)
        next.delete(videoBlockId)
        return next
      })
    },
    [clearPollingForBlock]
  )

  /**
   * Final step after Mux reports readyToStream. Persists the new video to the
   * block via VIDEO_BLOCK_UPDATE, refetches the journey, then removes the task.
   */
  const runVideoBlockUpdate = useCallback(
    async (videoBlockId: string, videoId: string) => {
      if (journey?.id == null) return

      updateTask(videoBlockId, { status: 'updating' })

      try {
        await videoBlockUpdate({
          variables: {
            id: videoBlockId,
            input: {
              videoId,
              source: VideoBlockSource.mux
            }
          },
          refetchQueries: [
            {
              query: GET_JOURNEY,
              variables: {
                id: journey.id,
                idType: IdType.databaseId,
                options: { skipRoutingFilter: true }
              }
            }
          ]
        })
        enqueueSnackbar(t('File uploaded successfully'), { variant: 'success' })
        removeTask(videoBlockId)
      } catch {
        enqueueSnackbar(t('Upload failed. Please try again'), {
          variant: 'error'
        })
        updateTask(videoBlockId, {
          status: 'error',
          error: 'Upload failed. Please try again'
        })
      }
    },
    [journey?.id, videoBlockUpdate, enqueueSnackbar, t, updateTask, removeTask]
  )

  /**
   * Polls getMyMuxVideo until readyToStream is true, then hands off to
   * runVideoBlockUpdate. Uses exponential backoff (×1.5, capped at 30s).
   * Retries up to MAX_RETRIES on transient errors before giving up.
   */
  const startPolling = useCallback(
    (videoBlockId: string, videoId: string) => {
      updateTask(videoBlockId, { status: 'processing', videoId })

      const poll = (delay: number) => {
        const timeout = setTimeout(async () => {
          try {
            const result = await getMyMuxVideo({
              variables: { id: videoId }
            })

            if (result.error != null) {
              throw result.error
            }

            if (result.data?.getMyMuxVideo?.readyToStream === true) {
              clearPollingForBlock(videoBlockId)
              await runVideoBlockUpdate(videoBlockId, videoId)
              return
            }

            retryCountRef.current.set(videoBlockId, 0)

            const nextDelay = Math.min(delay * 1.5, MAX_POLL_INTERVAL)
            pollingTimeoutsRef.current.set(
              videoBlockId,
              setTimeout(() => poll(nextDelay), delay)
            )
          } catch (err) {
            const currentRetries = retryCountRef.current.get(videoBlockId) ?? 0
            if (currentRetries < MAX_RETRIES) {
              retryCountRef.current.set(videoBlockId, currentRetries + 1)
              pollingTimeoutsRef.current.set(
                videoBlockId,
                setTimeout(() => poll(delay), delay)
              )
              return
            }

            clearPollingForBlock(videoBlockId)
            activeBlocksRef.current.delete(videoBlockId)
            enqueueSnackbar(t('Upload failed. Please try again'), {
              variant: 'error'
            })
            updateTask(videoBlockId, {
              status: 'error',
              error: 'Failed to check video status'
            })
          }
        }, delay)
        pollingTimeoutsRef.current.set(videoBlockId, timeout)
      }

      poll(INITIAL_POLL_INTERVAL)
    },
    [
      getMyMuxVideo,
      updateTask,
      clearPollingForBlock,
      runVideoBlockUpdate,
      enqueueSnackbar,
      t
    ]
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
    [createMuxVideoUploadByFile, updateTask, startPolling, enqueueSnackbar, t]
  )

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

  const value = useMemo(
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
