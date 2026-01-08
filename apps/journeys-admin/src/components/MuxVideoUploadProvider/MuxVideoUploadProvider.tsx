import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import {
  ReactElement,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'

import { TreeBlock } from '@core/journeys/ui/block'

import { CreateMuxVideoUploadByFileMutation } from '../../../__generated__/CreateMuxVideoUploadByFileMutation'

import { addUploadToQueue as addUploadTaskUtil } from './utils/addUploadToQueue'
import { cancelUploadForBlock as cancelUploadForBlockUtil } from './utils/cancelUploadForBlock'
import { TASK_CLEANUP_DELAY } from './utils/constants'
import { processUpload } from './utils/processUpload'
import { createShowSnackbar } from './utils/showSnackbar'
import type { PollingTask, UploadTask } from './utils/types'
import { VideoPoller } from './VideoPoller'

export const GET_MY_MUX_VIDEO_QUERY = gql`
  query GetMyMuxVideoQuery($id: ID!) {
    getMyMuxVideo(id: $id) {
      id
      assetId
      playbackId
      readyToStream
    }
  }
`

export const CREATE_MUX_VIDEO_UPLOAD_BY_FILE_MUTATION = gql`
  mutation CreateMuxVideoUploadByFileMutation(
    $name: String!
    $generateSubtitlesInput: GenerateSubtitlesInput
  ) {
    createMuxVideoUploadByFile(
      name: $name
      generateSubtitlesInput: $generateSubtitlesInput
    ) {
      uploadUrl
      id
    }
  }
`

interface MuxVideoUploadContextType {
  getUploadStatus: (videoBlockId: string) => UploadTask | null
  addUploadTask: (
    videoBlockId: string,
    file: File,
    languageCode?: string,
    languageName?: string,
    onComplete?: (videoId: string) => void
  ) => void
  cancelUploadForBlock: (block: TreeBlock) => void
}

const MuxVideoUploadContext = createContext<
  MuxVideoUploadContextType | undefined
>(undefined)

export function MuxVideoUploadProvider({
  children
}: {
  children: ReactNode
}): ReactElement {
  const [pollingTasks, setPollingTasks] = useState<Map<string, PollingTask>>(
    new Map()
  )
  const [uploadTasks, setUploadTasks] = useState<Map<string, UploadTask>>(
    new Map()
  )
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const hasShownStartNotification = useRef<Set<string>>(new Set())
  // Store stopPolling functions for each video (for cancellation)
  const stopPollingFnsRef = useRef<Map<string, () => void>>(new Map())
  // upchunk refs for aborting uploads
  const uploadInstanceRefs = useRef<Map<string, { abort: () => void }>>(
    new Map()
  )

  const [createMuxVideoUploadByFile] =
    useMutation<CreateMuxVideoUploadByFileMutation>(
      CREATE_MUX_VIDEO_UPLOAD_BY_FILE_MUTATION
    )

  const showSnackbar = useCallback(
    createShowSnackbar(enqueueSnackbar, closeSnackbar),
    [enqueueSnackbar, closeSnackbar]
  )

  // Register a stopPolling function for a video (called by VideoPoller)
  const registerStopPolling = useCallback(
    (videoId: string, stopFn: () => void) => {
      stopPollingFnsRef.current.set(videoId, stopFn)
    },
    []
  )

  // Unregister a stopPolling function (called by VideoPoller on cleanup)
  const unregisterStopPolling = useCallback((videoId: string) => {
    stopPollingFnsRef.current.delete(videoId)
  }, [])

  // Handle polling completion (called by VideoPoller)
  const handlePollingComplete = useCallback(
    (videoId: string) => {
      const task = pollingTasks.get(videoId)
      if (task == null) return

      setPollingTasks((prev) => {
        const next = new Map(prev)
        next.set(videoId, { ...task, status: 'completed' })
        return next
      })

      showSnackbar(t('Video upload completed'), 'success', {
        autoHideDuration: 4000,
        preventDuplicate: true,
        persist: false
      })

      // Call the completion callback
      if (task.onComplete != null) {
        task.onComplete()
      }

      // Remove from state after notification
      setTimeout(() => {
        setPollingTasks((prev) => {
          const next = new Map(prev)
          next.delete(videoId)
          return next
        })
      }, TASK_CLEANUP_DELAY)
    },
    [pollingTasks, showSnackbar, t]
  )

  // Handle polling error (called by VideoPoller)
  const handlePollingError = useCallback(
    (videoId: string, error: string) => {
      setPollingTasks((prev) => {
        const task = prev.get(videoId)
        if (task == null) return prev
        const next = new Map(prev)
        next.set(videoId, { ...task, status: 'error' })
        return next
      })

      showSnackbar(error, 'error', {
        autoHideDuration: 4000,
        preventDuplicate: true,
        persist: false
      })

      // Remove from state after notification
      setTimeout(() => {
        setPollingTasks((prev) => {
          const next = new Map(prev)
          next.delete(videoId)
          return next
        })
      }, TASK_CLEANUP_DELAY)
    },
    [showSnackbar]
  )

  // Handle polling timeout (called by VideoPoller)
  const handlePollingTimeout = useCallback(
    (videoId: string) => {
      handlePollingError(videoId, t('Video processing timed out'))
    },
    [handlePollingError, t]
  )

  // Start polling for a video
  const startPolling = useCallback(
    (videoId: string, languageCode?: string, onComplete?: () => void) => {
      // Show start notification only once per video
      if (!hasShownStartNotification.current.has(videoId)) {
        showSnackbar(t('Video upload in progress'), 'success', {
          autoHideDuration: 4000,
          preventDuplicate: true,
          persist: false
        })
        hasShownStartNotification.current.add(videoId)
      }

      // Create task entry - VideoPoller will pick this up and start polling
      setPollingTasks((prev) => {
        const next = new Map(prev)
        next.set(videoId, {
          videoId,
          languageCode,
          status: 'processing',
          startTime: Date.now(),
          onComplete
        })
        return next
      })
    },
    [showSnackbar, t]
  )

  // process all waiting upload tasks
  useEffect(() => {
    const waitingTasks = Array.from(uploadTasks.entries()).filter(
      ([, task]) => task.status === 'waiting'
    )

    if (waitingTasks.length === 0) return

    for (const [videoBlockId, task] of waitingTasks) {
      void processUpload(videoBlockId, task, {
        setUploadTasks,
        createMuxVideoUploadByFile,
        startPolling: (videoId, languageCode, onComplete) => {
          startPolling(videoId, languageCode, onComplete)
        },
        uploadInstanceRefs
      })
    }
  }, [uploadTasks, startPolling, createMuxVideoUploadByFile])

  const getUploadStatus = useCallback(
    (videoBlockId: string) => {
      return uploadTasks.get(videoBlockId) ?? null
    },
    [uploadTasks]
  )

  const addUploadTask = useCallback(
    (
      videoBlockId: string,
      file: File,
      languageCode?: string,
      languageName?: string,
      onComplete?: (videoId: string) => void
    ) => {
      addUploadTaskUtil(
        videoBlockId,
        file,
        languageCode,
        languageName,
        onComplete,
        {
          setUploadTasks
        }
      )
    },
    [setUploadTasks]
  )

  const cancelUploadForBlock = useCallback(
    (block: TreeBlock) => {
      cancelUploadForBlockUtil(block, {
        uploadTasks,
        setUploadTasks,
        setPollingTasks,
        uploadInstanceRefs,
        stopPollingFnsRef,
        hasShownStartNotification
      })
    },
    [uploadTasks]
  )

  // Get processing tasks that need polling
  const processingTasks = Array.from(pollingTasks.entries()).filter(
    ([, task]) => task.status === 'processing'
  )

  return (
    <MuxVideoUploadContext.Provider
      value={{
        getUploadStatus,
        addUploadTask,
        cancelUploadForBlock
      }}
    >
      {children}
      {/* Render a VideoPoller for each processing task - Apollo handles the polling */}
      {processingTasks.map(([videoId, task]) => (
        <VideoPoller
          key={videoId}
          videoId={videoId}
          startTime={task.startTime}
          onComplete={() => handlePollingComplete(videoId)}
          onError={(error) => handlePollingError(videoId, error)}
          onTimeout={() => handlePollingTimeout(videoId)}
          registerStopPolling={registerStopPolling}
          unregisterStopPolling={unregisterStopPolling}
        />
      ))}
    </MuxVideoUploadContext.Provider>
  )
}

export function useMuxVideoUpload(): MuxVideoUploadContextType {
  const context = useContext(MuxVideoUploadContext)
  if (context === undefined) {
    throw new Error(
      'useMuxVideoUpload must be used within a MuxVideoUploadProvider'
    )
  }
  return context
}
