import { gql, useLazyQuery, useMutation } from '@apollo/client'
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

import { GetMyMuxVideoQuery } from '../../../__generated__/GetMyMuxVideoQuery'
import { CreateMuxVideoUploadByFileMutation } from '../../../__generated__/CreateMuxVideoUploadByFileMutation'
import { useTranslation } from 'next-i18next'

import type { PollingTask, UploadTask } from './utils/types'
import { POLL_INTERVAL, MAX_POLL_TIME } from './utils/constants'
import { createShowSnackbar } from './utils/showSnackbar'
import { processUpload } from './utils/processUpload'
import { handlePollingComplete } from './utils/handlePollingComplete'
import { handlePollingError } from './utils/handlePollingError'
import { startPolling as startPollingUtil } from './utils/startPolling'
import { stopPolling as stopPollingUtil } from './utils/stopPolling'
import { addUploadToQueue as addUploadToQueueUtil } from './utils/addUploadToQueue'

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
  startPolling: (
    videoId: string,
    languageCode?: string,
    onComplete?: () => void
  ) => void
  stopPolling: (videoId: string) => void
  getPollingStatus: (videoId: string) => PollingTask | null
  getUploadStatus: (videoBlockId: string) => UploadTask | null
  addUploadToQueue: (
    videoBlockId: string,
    file: File,
    languageCode?: string,
    languageName?: string,
    onComplete?: (videoId: string) => void
  ) => void
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
  const [currentlyUploading, setCurrentlyUploading] = useState<string | null>(
    null
  )
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const hasShownStartNotification = useRef<Set<string>>(new Set())
  const stopQueryRefs = useRef<Map<string, () => void>>(new Map())
  const uploadInstanceRef = useRef<{
    abort: () => void
  } | null>(null)

  const [createMuxVideoUploadByFile] =
    useMutation<CreateMuxVideoUploadByFileMutation>(
      CREATE_MUX_VIDEO_UPLOAD_BY_FILE_MUTATION
    )

  const showSnackbar = useCallback(
    createShowSnackbar(enqueueSnackbar, closeSnackbar),
    [enqueueSnackbar, closeSnackbar]
  )

  // Process upload queue - one at a time
  useEffect(() => {
    if (currentlyUploading != null) return

    // Find next waiting task
    const waitingTask = Array.from(uploadTasks.entries()).find(
      ([, task]) => task.status === 'waiting'
    )

    if (waitingTask == null) return

    const [videoBlockId, task] = waitingTask
    setCurrentlyUploading(videoBlockId)
    void processUpload(videoBlockId, task, {
      setUploadTasks,
      createMuxVideoUploadByFile,
      setCurrentlyUploading,
      startPolling: (videoId, languageCode, onComplete) => {
        startPolling(videoId, languageCode, onComplete)
      },
      uploadInstanceRef
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadTasks, currentlyUploading])

  const handlePollingCompleteCallback = useCallback(
    async (videoId: string) => {
      await handlePollingComplete(videoId, {
        pollingTasks,
        setPollingTasks,
        showSnackbar,
        t
      })
    },
    [showSnackbar, t, pollingTasks]
  )

  const handlePollingErrorCallback = useCallback(
    (videoId: string, error: string) => {
      handlePollingError(videoId, error, {
        setPollingTasks,
        showSnackbar
      })
    },
    [showSnackbar]
  )

  const startPolling = useCallback(
    (videoId: string, languageCode?: string, onComplete?: () => void) => {
      startPollingUtil(videoId, languageCode, onComplete, {
        hasShownStartNotification,
        showSnackbar,
        t,
        setPollingTasks,
        stopQueryRefs
      })
    },
    [showSnackbar, t]
  )

  const stopPolling = useCallback((videoId: string) => {
    stopPollingUtil(videoId, {
      setPollingTasks,
      stopQueryRefs,
      hasShownStartNotification
    })
  }, [])

  const getUploadStatus = useCallback(
    (videoBlockId: string) => {
      return uploadTasks.get(videoBlockId) ?? null
    },
    [uploadTasks]
  )

  const addUploadToQueue = useCallback(
    (
      videoBlockId: string,
      file: File,
      languageCode?: string,
      languageName?: string,
      onComplete?: (videoId: string) => void
    ) => {
      addUploadToQueueUtil(
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
    []
  )

  const getPollingStatus = useCallback(
    (videoId: string) => {
      return pollingTasks.get(videoId) ?? null
    },
    [pollingTasks]
  )

  // Component to handle polling for each task
  function PollingTask({
    videoId,
    task
  }: {
    videoId: string
    task: PollingTask
  }): null {
    const hasStartedPolling = useRef(false)

    const [getMyMuxVideo, { stopPolling: stopQuery }] =
      useLazyQuery<GetMyMuxVideoQuery>(GET_MY_MUX_VIDEO_QUERY, {
        pollInterval: POLL_INTERVAL,
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'network-only',
        onCompleted: (data) => {
          const video = data?.getMyMuxVideo

          // Check if video is ready to stream
          if (
            video?.readyToStream === true &&
            video?.assetId != null &&
            video?.playbackId != null
          ) {
            handlePollingCompleteCallback(videoId)
          }

          // Check timeout
          if (Date.now() - task.startTime > MAX_POLL_TIME) {
            stopQuery()
            handlePollingErrorCallback(videoId, t('Video processing timed out'))
          }
        },
        onError: () => {
          handlePollingErrorCallback(
            videoId,
            t('Something went wrong, try again')
          )
        }
      })

    useEffect(() => {
      if (task.status !== 'processing') return
      if (hasStartedPolling.current) return

      hasStartedPolling.current = true

      // Store the stopQuery function in the ref map
      stopQueryRefs.current.set(videoId, stopQuery)

      // Start polling
      void getMyMuxVideo({
        variables: {
          id: videoId
        }
      })

      return () => {
        stopQuery()
        stopQueryRefs.current.delete(videoId)
      }
    }, [task.status])

    return null
  }

  return (
    <MuxVideoUploadContext.Provider
      value={{
        startPolling,
        stopPolling,
        getPollingStatus,
        getUploadStatus,
        addUploadToQueue
      }}
    >
      {children}
      {Array.from(pollingTasks.entries()).map(([videoId, task]) => (
        <PollingTask key={videoId} videoId={videoId} task={task} />
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
